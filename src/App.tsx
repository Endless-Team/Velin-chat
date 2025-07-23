import { useState, useEffect } from "react";
import Topbar from "./components/Topbar";
import Serverbar from "./components/Serverbar";
import Directmessage from "./components/Directmessage";

import Login from "./components/Login";

function App() {
  const [visualize, setVisualize] = useState("");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  //! Per Logout
  // localStorage.removeItem("user");
  // setUser(null);

  useEffect(() => {
    const handler = (_event: any, newPage: string) => {
      setVisualize(newPage);
    };

    window.electronAPI.on("page:visualize", handler);
    return () => {
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
        <Login onLoginSuccess={(user) => setUser(user)} />
      ) : (
        <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
          <Serverbar />
          <div style={{ flex: 1, padding: "1rem" }}>{content}</div>
        </div>
      )}
    </>
  );
}

export default App;
