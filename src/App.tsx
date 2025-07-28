import { useState, useEffect } from "react";
import Topbar from "./components/Topbar";
import Serverbar from "./components/Serverbar";
import Directmessage from "./components/Directmessage";
import Profile from "./components/Profile";

import Login from "./components/Login";

function App() {
  const [visualize, setVisualize] = useState("");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handler = (_event: any, newPage: string) => {
      setVisualize(newPage);
    };

    const resetUser = (_event: any) => {
      console.log("ciooooooooo");
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
      content = <Directmessage />;
      break;
    case "settings":
      content = <div className="text-custom-dark">Pagina Impostazioni</div>;
      break;
    case "about":
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
          <Serverbar />
          <div className="bg-custom-dark" style={{ flex: 1 }}>{content}</div>
          <Profile user={user} />
        </div>
      )}
    </>
  );
}

export default App;
