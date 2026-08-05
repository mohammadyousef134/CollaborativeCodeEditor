import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

function Documents() {

  const { projectId } = useParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [commits, setCommits] = useState([]);
  const [commitMessage, setCommitMessage] = useState("");
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [commitError, setCommitError] = useState("");

  useEffect(() => {
    loadDocuments();
    loadCommits();
  }, [projectId]);

  const inviteUser = async () => {
    if (!inviteEmail.trim()) return;

    await api.post(`/projects/${projectId}/invite`, {
      email: inviteEmail
    });

    setInviteEmail("");

    alert("Invitation sent");

  };

  const loadDocuments = async () => {

    try {
      const res = await api.get(`/projects/${projectId}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load documents", err);
    }

  };

  const loadCommits = async () => {

    try {
      const res = await api.get(`/api/repos/${projectId}/commits`);
      setCommits(res.data);
    } catch (err) {
      console.error("Failed to load commit history", err);
      setCommitError("Could not load commit history");
    }

  };

  const createCommit = async () => {

    try {
      setCommitError("");
      const res = await api.post(`/api/repos/${projectId}/commits`, {
        message: commitMessage
      });

      setCommitMessage("");
      setSelectedCommit(res.data);
      loadCommits();
    } catch (err) {
      console.error("Failed to create commit", err);
      setCommitError("Could not create commit");
    }

  };

  const inspectCommit = async (commitId) => {

    try {
      setCommitError("");
      const res = await api.get(`/api/repos/${projectId}/commits/${commitId}`);
      setSelectedCommit(res.data);
    } catch (err) {
      console.error("Failed to load commit", err);
      setCommitError("Could not load commit");
    }

  };

  const parseSnapshot = (commit) => {
    if (!commit?.snapshot) return [];

    try {
      return JSON.parse(commit.snapshot);
    } catch (err) {
      console.error("Failed to parse commit snapshot", err);
      return [];
    }
  };

  const shortHash = (hash) => hash ? hash.slice(0, 8) : "";

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString();
  };

  const createDocument = async () => {

    if (!newDocumentName.trim()) return;

    await api.post(`/projects/${projectId}/documents`, {
      name: newDocumentName,
      language: language
    });

    setNewDocumentName("");
    loadDocuments();

  };

  const deleteDocument = async (id) => {

    await api.delete(`/projects/${projectId}/documents/${id}`);

    loadDocuments();

  };

  return (
    <div>

      <h3>Invite collaborator</h3>

      <input
        placeholder="User email"
        value={inviteEmail}
        onChange={(e) => setInviteEmail(e.target.value)}
      />

      <button onClick={inviteUser}>
        Invite
      </button>

      <hr />

      <h3>Documents</h3>

      <input
        placeholder="New document name"
        value={newDocumentName}
        onChange={(e) => setNewDocumentName(e.target.value)}
      />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
      </select>

      <button onClick={createDocument}>
        Create Document
      </button>

      <hr />

      {documents.map(doc => (
        <div key={doc.id}>

          <span
            onClick={() => navigate(`/projects/${projectId}/documents/${doc.id}`)}
            style={{ cursor: "pointer", marginRight: "10px" }}
          >
            {doc.name}
          </span>

          <button onClick={() => deleteDocument(doc.id)}>
            Delete
          </button>

        </div>
      ))}

      <hr />

      <h3>Version History</h3>

      <input
        placeholder="Commit message"
        value={commitMessage}
        onChange={(e) => setCommitMessage(e.target.value)}
      />

      <button onClick={createCommit}>
        Commit Current Project
      </button>

      {commitError && <p style={{ color: "crimson" }}>{commitError}</p>}

      {commits.length === 0 && <p>No commits yet</p>}

      {commits.map(commit => (
        <div key={commit.id} style={{ marginBottom: "8px" }}>

          <button onClick={() => inspectCommit(commit.id)}>
            View
          </button>

          <span style={{ marginLeft: "10px", marginRight: "10px" }}>
            <b>{shortHash(commit.hash)}</b> {commit.message}
          </span>

          <small>
            {commit.authorEmail} - {formatDate(commit.createdAt)}
          </small>

        </div>
      ))}

      {selectedCommit && (
        <div style={{ marginTop: "12px" }}>

          <h4>
            Snapshot {shortHash(selectedCommit.hash)}
          </h4>

          {parseSnapshot(selectedCommit).map(node => (
            <div key={`${selectedCommit.id}-${node.id}`}>

              <b>{node.type}</b> {node.path}

              {node.type === "FILE" && (
                <pre style={{ background: "#111", color: "#eee", padding: "8px", overflowX: "auto" }}>
                  {node.content || ""}
                </pre>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Documents;
