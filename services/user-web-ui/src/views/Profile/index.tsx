import React, { useEffect } from "react";

const RideHistory: React.FC = () => {
	useEffect(() => {
		document.title = "Profile - Avec";
}, []);
	return (
		<div>
			<h1>Profile</h1>
		</div>
	);
};

export default RideHistory;
