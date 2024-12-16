import React, { useEffect } from "react";

const Payments: React.FC = () => {
	useEffect(() => {
		document.title = "Payments - Avec";
}, []);
	return (
		<div>
			<h1>Payments</h1>
		</div>
	);
};

export default Payments;
