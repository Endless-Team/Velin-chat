import { useState } from "react";

function Login({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await window.electronAPI.invoke(
        "user:login",
        username,
        password
      );
      if (res.success) {
        onLoginSuccess(res.user);
        // Salva lo stato loggato
        localStorage.setItem("user", JSON.stringify(res.user));
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError("Errore durante il login");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="mb-3">Login</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary w-100">
          Accedi
        </button>
      </form>
    </div>
  );
}

export default Login;
