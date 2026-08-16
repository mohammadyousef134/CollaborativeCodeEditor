import { useEffect, useState } from "react";
import api from "../api/api";

function Invitations() {

  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {

    const res = await api.get("/invitations");

    setInvitations(res.data);

  };

  const acceptInvitation = async (id) => {

    await api.post(`/invitations/${id}/accept`);

    loadInvitations();

  };

  const declineInvitation = async (id) => {

    await api.post(`/invitations/${id}/decline`);

    loadInvitations();

  };

  return (
    <div className="page-wide">
      <h2>Invitations</h2>

      {invitations.length === 0 && (
        <div className="card text-muted">No invitations</div>
      )}

      <div className="stack">
        {invitations.map(inv => (
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