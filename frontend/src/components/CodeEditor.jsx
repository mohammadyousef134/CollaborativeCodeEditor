import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

const EXECUTABLE_LANGUAGES = ["python", "cpp", "csharp"];
import api from "../api/api";
import { getCurrentUserId } from "../utils/Jwt";
import { colorForUserId, initialsForName } from "../utils/Presence";

const SAVE_DELAY_MS = 1000;

function CodeEditor({ repoId, fileId, initialContent, language, readOnly }) {
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const savePathRef = useRef(`/api/repos/${repoId}/nodes/${fileId}`);
  const currentContentRef = useRef(initialContent ?? "");
  const lastSavedContentRef = useRef(initialContent ?? "");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);

  function scheduleSave(content) {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (content === lastSavedContentRef.current) return;

      try {
        await api.put(savePathRef.current, { content });
        lastSavedContentRef.current = content;
      } catch (error) {
        console.error("Failed to save document", error);
      }
    }, SAVE_DELAY_MS);
  }

  function teardownConnection() {
    bindingRef.current?.destroy();
    providerRef.current?.destroy();
    ydocRef.current?.destroy();
    bindingRef.current = null;
    providerRef.current = null;
    ydocRef.current = null;
    setOnlineUsers([]);
  }

  function handleEditorDidMount(editor) {
    // guard: if this fires again on the same component instance (HMR, remount, etc.),
    // tear down the previous connection first instead of leaking it
    teardownConnection();

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const ytext = ydoc.getText("monaco");

    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      `file-${fileId}`,
      ydoc
    );
    providerRef.current = provider;

    const userId = getCurrentUserId();

    // fetch our own name once and publish it via awareness
    api.get("/auth/me").then((res) => {
      provider.awareness.setLocalStateField("user", {
        id: res.data.id,
        name: res.data.name
      });
    }).catch(() => {
      provider.awareness.setLocalStateField("user", { id: userId, name: null });
    });

    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states
        .map((state) => state.user)
        .filter((user) => user && user.id !== undefined && user.id !== null);
      setOnlineUsers(users);
    });

    provider.on("sync", (isSynced) => {
      if (isSynced && ytext.length === 0 && initialContent) {
        ydoc.transact(() => {
          ytext.insert(0, initialContent);
        }, "initial-load");
      }
    });

    ytext.observe((event) => {
      if (event.transaction.origin === "initial-load") {
        currentContentRef.current = ytext.toString();
        return;
      }

      const nextContent = ytext.toString();
      currentContentRef.current = nextContent;
      scheduleSave(nextContent);
    });

    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );
    bindingRef.current = binding;
  }

  async function runCode() {
    setRunning(true);
    setOutput(null);

    try {
      if (currentContentRef.current !== lastSavedContentRef.current) {
        await api.put(savePathRef.current, { content: currentContentRef.current });
        lastSavedContentRef.current = currentContentRef.current;
      }

      const res = await api.post(`/api/repos/${repoId}/nodes/${fileId}/execute`);
      setOutput(res.data);
    } catch (error) {
      setOutput({
        stdout: "",
        stderr: error.response?.data?.message || "Failed to run code",
        exitCode: null
      });
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    const savePath = savePathRef.current;

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (currentContentRef.current !== lastSavedContentRef.current) {
        api.put(savePath, { content: currentContentRef.current }).catch((error) => {
          console.error("Failed to save document during cleanup", error);
        });
      }

      bindingRef.current?.destroy();
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
    };
  }, []);

  return (
    <div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        background: "#252526"
      }}>
        <span style={{ color: "#888", fontSize: 12 }}>
          {onlineUsers.length <= 1 ? "Only you" : `${onlineUsers.length} online`}
        </span>

        {readOnly && (
          <span style={{ color: "#e5c07b", fontSize: 12, fontWeight: 600 }}>
            View only
          </span>
        )}

        {!readOnly && EXECUTABLE_LANGUAGES.includes(language) && (
          <button onClick={runCode} disabled={running} style={{ marginLeft: "auto" }}>
            {running ? "Running..." : "Run"}
          </button>
        )}

        <div style={{ display: "flex" }}>
          {onlineUsers.map((user, i) => (
            <div
              key={`${user.id}-${i}`}
              title={user.name || `User #${user.id}`}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: colorForUserId(user.id),
                color: "#1e1e1e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                border: "2px solid #252526",
                marginLeft: i === 0 ? 0 : -8,
                cursor: "default"
              }}
            >
              {initialsForName(user.name, user.id)}
            </div>
          ))}
        </div>
      </div>

      <Editor
        height="70vh"
        language={language}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{ readOnly: !!readOnly }}
      />

      {output !== null && (
        <div style={{
          background: "#1e1e1e",
          borderTop: "1px solid #333",
          padding: 10,
          fontFamily: "monospace",
          fontSize: 13,
          height: "20vh",
          overflowY: "auto"
        }}>
          {output.stdout && (
            <pre style={{ color: "#ddd", margin: 0, whiteSpace: "pre-wrap" }}>{output.stdout}</pre>
          )}
          {output.stderr && (
            <pre style={{ color: "#e06c75", margin: 0, whiteSpace: "pre-wrap" }}>{output.stderr}</pre>
          )}
          {!output.stdout && !output.stderr && (
            <span style={{ color: "#666" }}>(no output)</span>
          )}
          {output.exitCode !== null && output.exitCode !== undefined && (
            <div style={{ color: "#666", marginTop: 6 }}>Exit code: {output.exitCode}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default CodeEditor;