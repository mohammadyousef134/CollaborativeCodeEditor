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
    <div>

      <h2>Invitations</h2>

      {invitations.length === 0 && <p>No invitations</p>}

      {invitations.map(inv => (

        <div key={inv.invitationId}>

          <p>
            Repository: <b>{inv.repoName}</b>
          </p>

          <p>
            Invited by: {inv.invitedBy}
          </p>

          <p>
            Role: {inv.role}
          </p>

          <button onClick={() => acceptInvitation(inv.invitationId)}>
            Accept
          </button>

          <button onClick={() => declineInvitation(inv.invitationId)}>
            Decline
          </button>

          <hr />

        </div>

      ))}

    </div>
  );
}

export default Invitations;