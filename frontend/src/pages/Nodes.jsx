import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { useToast } from "../components/ToastProvider";
import PromptModal from "../components/PromptModal";

function Nodes() {
  const { repoId, folderId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [newNodeType, setNewNodeType] = useState("FILE");
  const [nodes, setNode] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [newNodeName, setNewNodeName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EDITOR");
  const [language, setLanguage] = useState("cpp");

  const [renameTarget, setRenameTarget] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);

  useEffect(() => {
    loadNodes();
    loadBreadcrumbs();
  }, [repoId, folderId]);

  const inviteUser = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await api.post(`/api/repos/${repoId}/invite`, { email: inviteEmail, role: inviteRole });
      setInviteEmail("");
      showToast("Invitation sent", "success");
    } catch (err) {
      showToast(err.response?.data || "Failed to send invitation", "error");
    }
  };

  const loadNodes = async () => {
    try {
      const url = folderId
        ? `/api/repos/${repoId}/nodes?folderId=${folderId}`
        : `/api/repos/${repoId}/nodes`;
      const res = await api.get(url);
      setNode(res.data);
    } catch (err) {
      console.error("Failed to load nodes", err);
    }
  };

  // walk parentId chain up to root so refresh/direct-link still shows the full path
  const loadBreadcrumbs = async () => {
    if (!folderId) {
      setBreadcrumbs([]);
      return;
    }
    try {
      const trail = [];
      let currentId = folderId;
      while (currentId) {
        const res = await api.get(`/api/repos/${repoId}/nodes/${currentId}/info`);
        trail.unshift(res.data);
        currentId = res.data.parentId;
      }
      setBreadcrumbs(trail);
    } catch (err) {
      console.error("Failed to load breadcrumbs", err);
    }
  };

  const createNode = async () => {
    if (!newNodeName.trim()) return;

    try {
      await api.post(`/api/repos/${repoId}/nodes`, {
        name: newNodeName,
        type: newNodeType,
        language: newNodeType === "FILE" ? language : undefined,
        parentId: folderId || null
      });

      setNewNodeName("");
      loadNodes();
    } catch (err) {
      showToast(err.response?.data || "Failed to create node", "error");
    }
  };

  const deleteNode = async (id) => {
    try {
      await api.delete(`/api/repos/${repoId}/nodes/${id}`);
      loadNodes();
    } catch (err) {
      showToast(err.response?.data || "Failed to delete", "error");
    }
  };

  const confirmRename = async (newName) => {
    const node = renameTarget;
    setRenameTarget(null);
    if (!newName?.trim() || newName === node.name) return;

    try {
      await api.patch(`/api/repos/${repoId}/nodes/${node.id}/rename`, { name: newName });
      loadNodes();
    } catch (err) {
      showToast(err.response?.data || "Failed to rename", "error");
    }
  };

  const confirmMove = async (input) => {
    const node = moveTarget;
    setMoveTarget(null);

    const parentId = input.trim() === "" ? null : Number(input.trim());
    if (parentId !== null && Number.isNaN(parentId)) {
      showToast("Folder ID must be a number", "error");
      return;
    }

    try {
      await api.patch(`/api/repos/${repoId}/nodes/${node.id}/move`, { parentId });
      loadNodes();
    } catch (err) {
      showToast(err.response?.data || "Failed to move", "error");
    }
  };

  const openNode = (node) => {
    if (node.type === "FOLDER") {
      navigate(`/repos/${repoId}/nodes/${node.id}`);
    } else {
      navigate(`/repos/${repoId}/files/${node.id}`);
    }
  };

  return (
    <div className="page-wide">
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Invite collaborator</h3>
        <div className="row">
          <input
            placeholder="User email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ flex: 1 }}
          />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
            <option value="VIEWER">Viewer</option>
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="btn-primary" onClick={inviteUser}>Invite</button>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 16, fontFamily: "var(--font-display)", fontSize: 13 }}>
        <Link to={`/repos/${repoId}/nodes`}>Home</Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.id} className="row" style={{ gap: 8 }}>
            <span className="text-muted">/</span>
            <Link to={`/repos/${repoId}/nodes/${crumb.id}`}>{crumb.name}</Link>
          </span>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row">
          <input
            placeholder="New node name"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            style={{ flex: 1 }}
          />

          <select value={newNodeType} onChange={(e) => setNewNodeType(e.target.value)}>
            <option value="FILE">File</option>
            <option value="FOLDER">Folder</option>
          </select>

          {newNodeType === "FILE" && (
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
            </select>
          )}

          <button className="btn-primary" onClick={createNode}>Create</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {nodes.length === 0 && (
          <div style={{ padding: 20 }} className="text-muted">
            Empty — create a file or folder above.
          </div>
        )}

        {nodes.map((node) => (
          <div key={node.id} className="node-row">
            <span className="node-name" onClick={() => openNode(node)}>
              {node.type === "FOLDER" ? "📁" : "📄"} {node.name}
            </span>

            <div className="row">
              <button className="btn-ghost" onClick={() => setRenameTarget(node)}>Rename</button>
              <button className="btn-ghost" onClick={() => setMoveTarget(node)}>Move</button>
              <button className="btn-danger" onClick={() => deleteNode(node.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <PromptModal
        open={renameTarget !== null}
        title={`Rename "${renameTarget?.name ?? ""}"`}
        label="New name"
        defaultValue={renameTarget?.name ?? ""}
        confirmLabel="Rename"
        onCancel={() => setRenameTarget(null)}
        onConfirm={confirmRename}
      />

      <PromptModal
        open={moveTarget !== null}
        title={`Move "${moveTarget?.name ?? ""}"`}
        label="Target folder ID (leave empty for repo root)"
        defaultValue=""
        confirmLabel="Move"
        onCancel={() => setMoveTarget(null)}
        onConfirm={confirmMove}
      />
    </div>
  );
}

export default Nodes;