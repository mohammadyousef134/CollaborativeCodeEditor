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
    <div>

      <h2>Register</h2>

      <input
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />

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

      <button onClick={handleRegister}>
        Register
      </button>

      <br />

      <button onClick={() => navigate("/")}>
        Back to login
      </button>

    </div>
  );
}

export default Register;