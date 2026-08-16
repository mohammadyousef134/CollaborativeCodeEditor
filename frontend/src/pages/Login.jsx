import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {

    try {

      const response = await api.post("/auth/login", {
        email: email,
        password: password
      });

      const token = response.data;

      localStorage.setItem("token", token);

      navigate("/repos");

    } catch (error) {

      console.log(error);
      alert("Login failed");

    }
  };

  return (
    <div className="page">
      <div className="card stack">
        <h2>Sign in</h2>

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

        <button className="btn-primary" onClick={handleLogin}>
          Sign in
        </button>

        <button className="btn-ghost" onClick={() => navigate("/register")}>
          Create an account
        </button>

        <hr className="divider" />

        <div className="stack">
          <button onClick={() => (window.location.href = "http://localhost:8080/oauth2/authorization/google")}>
            Continue with Google
          </button>

          <button onClick={() => (window.location.href = "http://localhost:8080/oauth2/authorization/github")}>
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;