import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import CodeEditor from "../components/CodeEditor";

function FileEditor() {
  const { repoId, fileId } = useParams();
  const [initialContent, setInitialContent] = useState(null);
  const [language, setLanguage] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/api/repos/${repoId}/nodes/${fileId}`);
      setInitialContent(res.data.content || "");
      setLanguage(res.data.language || "javascript");
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
    />
  );
}

export default FileEditor;