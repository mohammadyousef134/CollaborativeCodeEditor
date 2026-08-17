import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" style={{ marginRight: 8, verticalAlign: "middle" }}>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: 8, verticalAlign: "middle" }}>
      <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  );
}

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const showToast = useToast();

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
      showToast(error.response?.data || "Registration failed", "error");

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

        <hr className="divider" />

        <div className="stack">
          <button onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/oauth2/authorization/google`)}>
            <GoogleIcon />Continue with Google
          </button>

          <button onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/oauth2/authorization/github`)}>
            <GitHubIcon />Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;