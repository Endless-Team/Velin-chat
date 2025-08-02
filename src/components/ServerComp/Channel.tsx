import { useState, useEffect } from "react";
import type { Channel } from "../../types";

function ChannelComp() {
	const [channel, setChannel] = useState<Channel | null>(null);

	useEffect(() => {
		const handleSelect = (event: Event) => {
			const customEvent = event as CustomEvent<Channel>;
			setChannel(customEvent.detail);
		};

		// Aggiungi listener
		window.addEventListener("channel:selected", handleSelect);

		// Se il server è già stato selezionato prima del mount
		const last = (window as any).selectedChannel;
		if (last) setChannel(last);

		return () => {
			window.removeEventListener("channel:selected", handleSelect);
		};
	}, []);



	return (
		<div className="bg-black w-100 h-100">
			<nav className="bg-custom-dark text-white p-2 border-bottom border-1 border-custom-border">
				<i className="bi bi-arrow-left mx-2"></i>
				{channel?.name}
			</nav>
		</div>
	);
}

export default ChannelComp;
