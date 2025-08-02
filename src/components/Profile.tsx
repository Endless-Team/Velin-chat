import { useState } from "react";
import type { User } from "../types";

function Profile({ user }: { user: User }) {
	const [showTooltip, setShowTooltip] = useState(false);

	return (
		<div
			className="position-fixed bottom-0 start-0 m-3 bg-custom-dark rounded d-flex align-items-center justify-content-between px-3 border border-body-tertiary"
			style={{ width: 200, height: 50 }}>
			<div
				className="position-relative cursor-pointer"
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}>
				<p className="mb-0 text-white">{user.username}</p>

				{showTooltip && (
					<div
						className="position-absolute bg-secondary text-white p-1 rounded small"
						style={{
							top: "-30px",
							left: "0",
							whiteSpace: "nowrap",
							fontSize: "0.75rem",
							zIndex: 10,
						}}>
						{/* ID: {toId(user._id.buffer)} */}
						ID: {user._id}
					</div>
				)}
			</div>

			<button
				onClick={() => {
					window.electronAPI.send("user:logout");
				}}
				className="btn rounded-circle bg-danger"
				style={{
					width: 40,
					height: 40,
					color: "white",
					border: "none",
				}}>
				<i className="bi bi-power"></i>
			</button>
		</div>
	);
}

export default Profile;
