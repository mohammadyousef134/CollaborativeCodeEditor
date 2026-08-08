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
    <div>

      <h2>Repositories</h2>

      <input
        placeholder="New Repository name"
        value={newRepoName}
        onChange={(e) => setNewRepoName(e.target.value)}
      />

      <button onClick={createRepo}>
        Create Repository
      </button>

      <hr />

      {repos.map(repo => (
        <div key={repo.id}>

          <span
            onClick={() => navigate(`/repos/${repo.id}/nodes`)}
            style={{ cursor: "pointer", marginRight: "10px" }}
          >
            {repo.name}
          </span>

          <button onClick={() => deleteRepo(repo.id)}>
            Delete
          </button>

        </div>
      ))}

      <button onClick={() => navigate("/invitations")}>
        Invitations
      </button>

    </div>
  );
}

export default Repos;