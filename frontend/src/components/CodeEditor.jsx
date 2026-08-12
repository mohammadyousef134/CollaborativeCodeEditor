import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
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
        height="90vh"
        language={language}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{ readOnly: !!readOnly }}
      />
    </div>
  );
}

export default CodeEditor;