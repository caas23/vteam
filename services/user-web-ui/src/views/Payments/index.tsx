import React, { useEffect, useState } from "react";
import "./index.css";
import PaymentDetails from "./paymentDetails";
import { fetchOneUserByGitId } from "../../fetchModels/fetchOneUser";

const Payments: React.FC = () => {
	const [userId, setUserId] = useState<string>("");

	const storedUser = sessionStorage.getItem("user");
	const gitId = storedUser && JSON.parse(storedUser).id
	
	useEffect(() => {
		document.title = "Payments - Solo Scoot";
		
		const fetchUserData = async () => {
			try {
				const result = await fetchOneUserByGitId(gitId);
				setUserId(result[0].user_id);
			} catch {
				setUserId("");
			}
		};
		  
		fetchUserData();
	}, []);

	return (
		<div>
			<h1>Payments</h1>
			<PaymentDetails userId={userId} />
		</div>
	);
};

export default Payments;
