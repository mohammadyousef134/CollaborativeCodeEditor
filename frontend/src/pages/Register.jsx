import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {

    try {

      await api.post("/auth/register", {
        name: name,
        email: email,
        password: password
      });

      const loginResponse = await api.post("/auth/login", {
        email: email,
        password: password
      });

      const token = loginResponse.data;

      localStorage.setItem("token", token);

      navigate("/repos");

    } catch (error) {

      console.log(error);
      alert(error.response?.data || "Registration failed");

    }
  };

  return (
    <div className="page">
      <div className="card stack">
        <h2>Create an account</h2>

        <div className="stack" style={{ gap: 6 }}>
          <label>Name</label>
          <input
            placeholder="Mohammad"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <label>Email</label>
          <input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={handleRegister}>
          Create account
        </button>

        <button className="btn-ghost" onClick={() => navigate("/")}>
          Back to sign in
        </button>
      </div>
    </div>
  );
}

export default Register;