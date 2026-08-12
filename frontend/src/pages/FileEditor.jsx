import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import CodeEditor from "../components/CodeEditor";

function FileEditor() {
  const { repoId, fileId } = useParams();
  const [initialContent, setInitialContent] = useState(null);
  const [language, setLanguage] = useState(null);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [fileRes, roleRes] = await Promise.all([
        api.get(`/api/repos/${repoId}/nodes/${fileId}`),
        api.get(`/api/repos/${repoId}/role`)
      ]);
      setInitialContent(fileRes.data.content || "");
      setLanguage(fileRes.data.language || "javascript");
      setReadOnly(roleRes.data.role === "VIEWER");
    };
    load();
  }, [repoId, fileId]);

  if (initialContent === null || language === null) {
    return <div style={{ color: "#fff", padding: 20 }}>Loading...</div>;
  }

  return (
    <CodeEditor
      repoId={repoId}
      fileId={fileId}
      initialContent={initialContent}
      language={language}
      readOnly={readOnly}
    />
  );
}

export default FileEditor;