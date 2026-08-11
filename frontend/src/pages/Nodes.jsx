import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api";

function Nodes() {
  const { repoId, folderId } = useParams();
  const navigate = useNavigate();

  const [newNodeType, setNewNodeType] = useState("FILE");
  const [nodes, setNode] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [newNodeName, setNewNodeName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [language, setLanguage] = useState("javascript");

  useEffect(() => {
    loadNodes();
    loadBreadcrumbs();
  }, [repoId, folderId]);

  const inviteUser = async () => {
    if (!inviteEmail.trim()) return;
    await api.post(`/api/repos/${repoId}/invite`, { email: inviteEmail });
    setInviteEmail("");
    alert("Invitation sent");
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

    await api.post(`/api/repos/${repoId}/nodes`, {
      name: newNodeName,
      type: newNodeType,
      language: newNodeType === "FILE" ? language : undefined,
      parentId: folderId || null
    });

    setNewNodeName("");
    loadNodes();
  };

  const deleteNode = async (id) => {
    await api.delete(`/api/repos/${repoId}/nodes/${id}`);
    loadNodes();
  };

  const renameNode = async (node) => {
    const newName = prompt("New name:", node.name);
    if (newName === null) return; // cancelled
    if (!newName.trim() || newName === node.name) return;

    try {
      await api.patch(`/api/repos/${repoId}/nodes/${node.id}/rename`, { name: newName });
      loadNodes();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rename");
    }
  };

  const moveNode = async (node) => {
    const input = prompt("Target folder ID (leave empty for repo root):", "");
    if (input === null) return; // cancelled

    const parentId = input.trim() === "" ? null : Number(input.trim());
    if (parentId !== null && Number.isNaN(parentId)) {
      alert("Folder ID must be a number");
      return;
    }

    try {
      await api.patch(`/api/repos/${repoId}/nodes/${node.id}/move`, { parentId });
      loadNodes();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to move");
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
    <div>
      <h3>Invite collaborator</h3>
      <input
        placeholder="User email"
        value={inviteEmail}
        onChange={(e) => setInviteEmail(e.target.value)}
      />
      <button onClick={inviteUser}>Invite</button>

      <hr />

      <div>
        <Link to={`/repos/${repoId}/nodes`}>Home</Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.id}>
            {" / "}
            <Link to={`/repos/${repoId}/nodes/${crumb.id}`}>{crumb.name}</Link>
          </span>
        ))}
      </div>

      <hr />

      <h3>Nodes</h3>

      <input
        placeholder="New node name"
        value={newNodeName}
        onChange={(e) => setNewNodeName(e.target.value)}
      />

      <select value={newNodeType} onChange={(e) => setNewNodeType(e.target.value)}>
        <option value="FILE">File</option>
        <option value="FOLDER">Folder</option>
      </select>

      {newNodeType === "FILE" && (
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      )}

      <button onClick={createNode}>Create Node</button>

      <hr />

      {nodes.map((node) => (
        <div key={node.id}>
          <span
            onClick={() => openNode(node)}
            style={{ cursor: "pointer", marginRight: "10px" }}
          >
            {node.type === "FOLDER" ? "📁" : "📄"} {node.name}
          </span>

          <button onClick={() => renameNode(node)}>Rename</button>
          <button onClick={() => moveNode(node)}>Move</button>
          <button onClick={() => deleteNode(node.id)}>Delete</button>
        </div>
      ))}

      <hr />
    </div>
  );
}

export default Nodes;