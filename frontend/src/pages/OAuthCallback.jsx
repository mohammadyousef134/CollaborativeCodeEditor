import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/repos");
    } else {
      alert("Login failed");
      navigate("/");
    }
  }, [searchParams, navigate]);

  return <div>Signing you in...</div>;
}

export default OAuthCallback;