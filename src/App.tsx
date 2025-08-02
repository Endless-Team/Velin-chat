import { useState, useEffect } from "react";
import type { User } from "./types";

import Topbar from "./components/Topbar";
import Serverbar from "./components/Serverbar";
import Profile from "./components/Profile";

import DirectmessageComp from "./components/Directmessage";
import ServerComp from "./components/Server";

import Login from "./components/Login";

function App() {
	const [visualize, setVisualize] = useState("");
	const [user, setUser] = useState<User | null>(() => {
		const saved = localStorage.getItem("user");
		return saved ? JSON.parse(saved) : null;
	});

	useEffect(() => {
		const handler = (_event: any, newPage: string) => {
			setVisualize(newPage);
		};

		const resetUser = (_event: any) => {
			localStorage.removeItem("user");
			setUser(null);
		};

		window.electronAPI.on("user:logout", resetUser);
		window.electronAPI.on("page:visualize", handler);
		return () => {
			window.electronAPI.off("user:logout", resetUser);
			window.electronAPI.off("page:visualize", handler);
		};
	}, []);

	let content;
	switch (visualize) {
		case "dm":
		default:
			content = <DirectmessageComp />;
			break;
		case "server":
			content = <ServerComp />;
			break;
		case "settings":
			content = <div className="text-custom-dark">Pagina Info</div>;
			break;
	}

	return (
		<>
			<Topbar />

			{!user ? (
				<div style={{ backgroundColor: "#242424" }}>
					<Login onLoginSuccess={(user) => setUser(user)} />
				</div>
			) : (
				<div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
					<Serverbar user={user} />
					<div className="bg-custom-dark" style={{ flex: 1 }}>
						{content}
					</div>
					<Profile user={user} />
				</div>
			)}
		</>
	);
}

export default App;
