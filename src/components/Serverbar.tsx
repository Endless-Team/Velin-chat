import { useEffect, useState } from "react";

type Server = {
  _id: string;
  name: string;
  src: string;
  channels: any[]; // puoi migliorarlo con una struttura precisa se vuoi
};

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

  const handleClick = (page: string) => {
    window.electronAPI.send("page:load", page);
  };

  const onServerClick = (server: Server) => {
    window.electronAPI.send("server:selected", server);
  };

  const random = () => {
    var min = 1;
    var max = 100;
    return min + Math.random() * (max - min);
  };

  return (
    <aside className="m-0 w-side vh-100 bg-custom-dark">
      <ul className="m-0 bg-custom-transparent list-unstyled d-flex flex-column align-items-center pt-2">
        <li>
          <img
            className="btn border-0 p-0 rounded bg-primary d-flex align-items-center justify-content-center server-ico"
            src="https://picsum.photos/40"
            alt="Random"
            onClick={() => handleClick("dm")}
          />
        </li>
        <hr className="custom-divider" />
        {servers.map((server) => (
          // <li key={String(server._id) || random}>
          <li key={random()}>
            <img
              className="btn border-0 p-0 rounded bg-primary d-flex align-items-center justify-content-center server-ico"
              style={{ marginTop: 8 }}
              src={server.src || "https://via.placeholder.com/40"}
              alt={server.name}
              onClick={() => onServerClick(server)}
            />
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Serverbar;
