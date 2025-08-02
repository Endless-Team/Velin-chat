import { useState, useEffect } from "react";
import type { Channel, Server } from "../types";
import { toId } from "../utils/id";

import ChannelComp from "./ServerComp/Channel";
import HomeComp from "./ServerComp/Home";

function ServerComp() {
	const [visualize, setVisualize] = useState("");
	const [server, setServer] = useState<Server | null>(null);

	useEffect(() => {
		const handleSelect = (event: Event) => {
			const customEvent = event as CustomEvent<Server>;
			setServer(customEvent.detail);
		};

		// Aggiungi listener
		window.addEventListener("server:selected", handleSelect);

		// Se il server è già stato selezionato prima del mount
		const last = (window as any).selectedServer;
		if (last) setServer(last);

		return () => {
			window.removeEventListener("server:selected", handleSelect);
		};
	}, []);

	const onGeneralClick = (section: any) => {
		setVisualize(section);
	};

	const onChannelClick = (channel: Channel) => {
		(window as any).selectedChannel = server;
		window.dispatchEvent(
			new CustomEvent("channel:selected", { detail: channel })
		);
	};

	let content;
	switch (visualize) {
		case "home":
		default:
			content = <HomeComp />;
			break;
		case "channel":
			content = <ChannelComp />;
			break;
		case "settings":
			content = <div className="text-custom-dark">Pagina Info</div>;
			break;
	}

	return (
		<div
			className="custom-border vh-100"
			style={{ display: "flex", flexDirection: "row" }}>
			<aside
				className="h-100 bg-custom-gray"
				style={{ width: 150, borderTopLeftRadius: 25 }}>
				<ul className="m-0 bg-custom-transparent list-unstyled d-flex flex-column align-items-left pt-2 text-white">
					<li className="ms-2">
						<i className="bi bi-house-fill me-1"></i>
						{server?.name}
					</li>
					<hr
						className="w-100 bg-white"
						style={{
							height: 2,
							margin: 0,
							marginTop: 8,
						}}
					/>
					{server?.channels.map((channel) => (
						<li
							className="m-0 mt-1 ms-2 cursor-pointer"
							style={{ display: "flex", flexDirection: "row" }}
							key={toId(channel._id?.buffer)}
							onClick={() => {
                onGeneralClick("channel")
								onChannelClick(channel);
							}}>
							<i
								className={`bi bi-${
									channel.type === "text" ? "hash" : "volume-up-fill"
								} me-1`}></i>
							<p className="m-0">{channel.name}</p>
						</li>
					))}
				</ul>
			</aside>
			{content}
		</div>
	);
}

export default ServerComp;
