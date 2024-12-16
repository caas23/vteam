import React, { useEffect } from "react";
// import "./index.css";

const Users: React.FC = () => {
	useEffect(() => {
		document.title = "Users - Avec";
}, []);
	return (
		<div>
			<h1>Users</h1>
		</div>
	);
};

export default Users;
