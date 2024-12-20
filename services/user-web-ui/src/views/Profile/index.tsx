import React, { useEffect } from "react";

const RideHistory: React.FC = () => {
	useEffect(() => {
		document.title = "Profile - Solo Scoot";
}, []);
	return (
		<div>
			<h1>Profile</h1>
		</div>
	);
};

export default RideHistory;
