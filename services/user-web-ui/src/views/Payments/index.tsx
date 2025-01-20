import React, { useEffect } from "react";
import "./index.css";

const Payments: React.FC = () => {
	useEffect(() => {
		document.title = "Payments - Solo Scoot";
}, []);
	return (
		<div>
			<h1>Payments</h1>
		</div>
	);
};

export default Payments;
