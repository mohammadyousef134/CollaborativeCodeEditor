import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

function Nodes() {

  const { repoId } = useParams();
  const navigate = useNavigate();

  const [newNodeType, setNewNodeType] = useState("FILE");
  const [nodes, setNode] = useState([]);
  const [newNodeName, setNewNodeName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [language, setLanguage] = useState("javascript");

  useEffect(() => {
    loadNodes();
  }, [repoId]);

  const inviteUser = async () => {
    if (!inviteEmail.trim()) return;

    await api.post(`/api/repos/${repoId}/invite`, {
      email: inviteEmail
    });

    setInviteEmail("");

    alert("Invitation sent");

  };

  const loadNodes = async () => {

    try {
      const res = await api.get(`/api/repos/${repoId}/nodes`);
      setNode(res.data);
    } catch (err) {
      console.error("Failed to load nodes", err);
    }

  };

  const createNode = async () => {

    if (!newNodeName.trim()) return;

    await api.post(`/api/repos/${repoId}/nodes`, {
      name: newNodeName,
      type: newNodeType,
      language: newNodeType === "FILE" ? language : undefined
    });

    setNewNodeName("");
    loadNodes();

  };

  const deleteNode = async (id) => {

    await api.delete(`/api/repos/${repoId}/nodes/${id}`);

    loadNodes();

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

      <button onClick={createNode}>
        Create Node
      </button>

      <hr />

      {nodes.map(node => (
        <div key={node.id}>

          <span
            onClick={() => navigate(`/repos/${repoId}/nodes/${node.id}`)}
            style={{ cursor: "pointer", marginRight: "10px" }}
          >
            {node.name}
          </span>

          <button onClick={() => deleteNode(node.id)}>
            Delete
          </button>

        </div>
      ))}

      <hr />
    </div>
  );
}

export default Nodes;