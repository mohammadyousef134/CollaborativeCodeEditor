import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import api from "../api/api";

const SAVE_DELAY_MS = 1000;

function CodeEditor({ repoId, fileId, initialContent, language }) {
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const savePathRef = useRef(`/api/repos/${repoId}/nodes/${fileId}`);
  const currentContentRef = useRef(initialContent ?? "");
  const lastSavedContentRef = useRef(initialContent ?? "");

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

  function handleEditorDidMount(editor) {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const ytext = ydoc.getText("monaco");

    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      `file-${fileId}`,
      ydoc
    );
    providerRef.current = provider;

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
    <Editor
      height="90vh"
      language={language}
      theme="vs-dark"
      onMount={handleEditorDidMount}
    />
  );
}

export default CodeEditor;