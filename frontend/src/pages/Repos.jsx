import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Repos() {

  const [repos, setRepos] = useState([]);
  const [newRepoName, setNewRepoName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    const res = await api.get("/api/repos");
    setRepos(res.data);
  };

  const createRepo = async () => {
    if (!newRepoName) return;
    await api.post("/api/repos", {
      name: newRepoName
    });

    setNewRepoName("");
    loadRepos();

  };

  const deleteRepo = async (id) => {

    await api.delete(`/api/repos/${id}`);
    loadRepos();

  };

  return (
    <div className="page-wide">
      <div className="row-between" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Repositories</h2>
        <button className="btn-ghost" onClick={() => navigate("/invitations")}>
          Invitations
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row">
          <input
            placeholder="New repository name"
            value={newRepoName}
            onChange={(e) => setNewRepoName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={createRepo}>
            Create
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {repos.length === 0 && (
          <div style={{ padding: 20 }} className="text-muted">
            No repositories yet — create one above.
          </div>
        )}

        {repos.map(repo => (
          <div key={repo.id} className="node-row">
            <span
              className="node-name"
              onClick={() => navigate(`/repos/${repo.id}/nodes`)}
            >
              {repo.name}
            </span>

            <button className="btn-danger" onClick={() => deleteRepo(repo.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Repos;