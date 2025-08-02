import { useState } from "react";
import { toId } from "../utils/id";

function Login({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
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
				const parsedUser = {
					...res.user,
					_id: toId(res.user._id), // <-- Converti in stringa decimale
				};
				onLoginSuccess(parsedUser);
				if (rememberMe) {
					localStorage.setItem("user", JSON.stringify(parsedUser));
				}
			} else {
				setError(res.error);
			}
		} catch (err) {
			setError("Errore durante il login");
		}
	};

	return (
		<div className="container pt-5 text-white" style={{ maxWidth: "400px" }}>
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

				<div className="d-flex justify-content-between align-items-center">
					<div className="form-check mb-0">
						<input
							className="form-check-input"
							type="checkbox"
							id="rememberMe"
							checked={rememberMe}
							onChange={(e) => setRememberMe(e.target.checked)}
						/>
						<label className="form-check-label ms-1" htmlFor="rememberMe">
							Rimani connesso
						</label>
					</div>

					<button type="submit" className="btn btn-primary">
						Accedi
					</button>
				</div>
			</form>
		</div>
	);
}

export default Login;
