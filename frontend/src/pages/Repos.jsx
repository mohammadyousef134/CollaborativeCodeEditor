import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import ConfirmModal from "../components/ConfirmModal";

function Repos() {

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRepoName, setNewRepoName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    try {
      const res = await api.get("/api/repos");
      setRepos(res.data);
    } catch (err) {
      showToast(err.response?.data || "Failed to load repositories", "error");
    } finally {
      setLoading(false);
    }
  };

  const createRepo = async () => {
    if (!newRepoName) return;
    try {
      await api.post("/api/repos", {
        name: newRepoName
      });

      setNewRepoName("");
      loadRepos();
    } catch (err) {
      showToast(err.response?.data || "Failed to create repository", "error");
    }
  };

  const confirmDelete = async () => {
    const repo = deleteTarget;
    setDeleteTarget(null);

    try {
      await api.delete(`/api/repos/${repo.id}`);
      loadRepos();
    } catch (err) {
      showToast(err.response?.data || "Failed to delete repository", "error");
    }
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
        {loading && (
          <div style={{ padding: 20 }} className="text-muted">Loading...</div>
        )}

        {!loading && repos.length === 0 && (
          <div style={{ padding: 20 }} className="text-muted">
            No repositories yet — create one above.
          </div>
        )}

        {!loading && repos.map(repo => (
          <div key={repo.id} className="node-row">
            <span
              className="node-name"
              onClick={() => navigate(`/repos/${repo.id}/nodes`)}
            >
              {repo.name}
            </span>

            <button className="btn-danger" onClick={() => setDeleteTarget(repo)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.name ?? ""}"?`}
        message="This will permanently delete the repository, all its files and folders, and remove access for every collaborator. This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default Repos;