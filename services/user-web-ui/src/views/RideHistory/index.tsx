import React, { useEffect } from "react";
// import Receipts from '../../components/Receipts';

const RideHistory: React.FC = () => {
	useEffect(() => {
		document.title = "Ride History - Avec";
}, []);
	return (
		<div>
			<h1>Ride History</h1>
            <p>Overview of your past rides.</p>
			{/* <Receipts /> */}
		</div>
	);
};

export default RideHistory;
