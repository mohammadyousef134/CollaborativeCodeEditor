import { useEffect, useState } from "react";
import api from "../api/api";
import { useToast } from "../components/ToastProvider";

function Invitations() {

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const res = await api.get("/invitations");
      setInvitations(res.data);
    } catch (err) {
      showToast(err.response?.data || "Failed to load invitations", "error");
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (id) => {
    try {
      await api.post(`/invitations/${id}/accept`);
      loadInvitations();
    } catch (err) {
      showToast(err.response?.data || "Failed to accept invitation", "error");
    }
  };

  const declineInvitation = async (id) => {
    try {
      await api.post(`/invitations/${id}/decline`);
      loadInvitations();
    } catch (err) {
      showToast(err.response?.data || "Failed to decline invitation", "error");
    }
  };

  return (
    <div className="page-wide">
      <h2>Invitations</h2>

      {loading && (
        <div className="card text-muted">Loading...</div>
      )}

      {!loading && invitations.length === 0 && (
        <div className="card text-muted">No invitations</div>
      )}

      <div className="stack">
        {!loading && invitations.map(inv => (
          <div key={inv.invitationId} className="card">
            <div className="row-between" style={{ marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: 15, fontWeight: 600 }}>
                {inv.repoName}
              </span>
              <span className="badge badge-success">{inv.role}</span>
            </div>

            <p className="text-muted" style={{ margin: "0 0 16px 0" }}>
              Invited by {inv.invitedBy}
            </p>

            <div className="row">
              <button className="btn-primary" onClick={() => acceptInvitation(inv.invitationId)}>
                Accept
              </button>
              <button className="btn-danger" onClick={() => declineInvitation(inv.invitationId)}>
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Invitations;