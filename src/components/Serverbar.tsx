import { useEffect, useState } from "react";
import type { Server } from "../types";
import { toId } from "../utils/id";

function Serverbar({ user }: { user: any }) {
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const result = await window.electronAPI.invoke(
          "server:getAll",
          user.username
        );
        setServers(result);
      } catch (err) {
        console.error("Errore nel recupero server:", err);
      }
    };
    fetchServers();
  }, [user]);

  const onGeneralClick = (page: string) => {
    window.electronAPI.send("page:load", page);
  };

  const onServerClick = (server: Server) => {
    (window as any).selectedServer = server;
    window.dispatchEvent(
      new CustomEvent("server:selected", { detail: server })
    );
  };

  return (
    <aside className="m-0 w-side vh-100 bg-custom-dark">
      <ul className="m-0 bg-custom-transparent list-unstyled d-flex flex-column align-items-center pt-2">
        <li>
          <img
            className="btn border-0 p-0 rounded bg-primary d-flex align-items-center justify-content-center server-ico"
            src="https://picsum.photos/40"
            alt="Random"
            onClick={() => onGeneralClick("dm")}
          />
        </li>
        <hr
          className="w-50 bg-white"
          style={{
            height: 2,
            margin: 0,
            marginTop: 8,
          }}
        />
        {servers.map((server) => (
          <li key={toId(server._id?.buffer)}>
            <img
              className="btn border-0 p-0 rounded bg-primary d-flex align-items-center justify-content-center server-ico"
              style={{ marginTop: 8 }}
              src={server.src || "https://via.placeholder.com/40"}
              alt={server.name}
              onClick={() => {
                onServerClick(server);
                onGeneralClick("server");
              }}
            />
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Serverbar;
