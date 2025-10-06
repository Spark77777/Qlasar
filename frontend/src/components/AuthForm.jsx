import React, { useState } from "react";

export default function AuthForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    const endpoint = isLogin ? "/api/login" : "/api/signup";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else if (isLogin) onLogin(data.session);
      else alert("Account created! Please log in.");
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20, border: "1px solid #ccc", borderRadius: 12 }}>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, margin: "10px 0", borderRadius: 8, border: "1px solid #ccc" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, margin: "10px 0", borderRadius: 8, border: "1px solid #ccc" }}
      />
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      <button
        onClick={handleSubmit}
        style={{ width: "100%", padding: 12, backgroundColor: "#4A90E2", color: "#fff", border: "none", borderRadius: 8 }}
      >
        {isLogin ? "Login" : "Sign Up"}
      </button>
      <div style={{ marginTop: 10, textAlign: "center", cursor: "pointer", color: "#4A90E2" }}
           onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Create new account" : "Back to login"}
      </div>
    </div>
  );
}
