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

      alert("Login successful");

      navigate("/repos");

    } catch (error) {

      console.log(error);
      alert("Login failed");

    }
  };

  return (
    <div>

      <h2>Login</h2>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={handleLogin}>
        Login
      </button>

      <br />

      <button onClick={() => navigate("/register")}>
        Create an account
      </button>

      <br />
      <br />

      <button onClick={() => (window.location.href = "http://localhost:8080/oauth2/authorization/google")}>
        Continue with Google
      </button>

      <br />

      <button onClick={() => (window.location.href = "http://localhost:8080/oauth2/authorization/github")}>
        Continue with GitHub
      </button>

    </div>
  );
}

export default Login;