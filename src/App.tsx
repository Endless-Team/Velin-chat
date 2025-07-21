import { useState, useEffect } from "react";
import Topbar from "./components/Topbar";
import Serverbar from "./components/Serverbar";

function App() {
  const [visualize, setVisualize] = useState("");

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
    case "home":
      content = <div className="text-custom-dark">Pagina Home</div>;
      break;
    case "settings":
      content = <div className="text-custom-dark">Pagina Impostazioni</div>;
      break;
    case "about":
      content = <div className="text-custom-dark">Pagina Info</div>;
      break;
    default:
      content = <div className="text-custom-dark">Seleziona una pagina</div>;
  }

  return (
    <>
      <Topbar />
      <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
        <Serverbar />
        <div style={{ flex: 1, padding: "1rem" }}>{content}</div>
      </div>
    </>
  );
}

export default App;
