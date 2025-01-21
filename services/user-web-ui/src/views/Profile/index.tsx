import React, { useEffect, useState } from "react";
import "./index.css";
import { User as UserInterface } from "./interfaces";
import UserDetails from "./userDetails";
import { fetchOneUserByGitId } from "../../fetchModels/fetchOneUser";

const Profile: React.FC = () => {
	const [userData, setUserData] = useState< UserInterface | null | undefined >(undefined);

	const storedUser = sessionStorage.getItem("user");
	const gitId = storedUser && JSON.parse(storedUser).id
	
	useEffect(() => {
		document.title = "Profile - Solo Scoot";
		
		const fetchUserData = async () => {
			try {
				const result = await fetchOneUserByGitId(gitId);
				setUserData(result[0]);
			} catch {
			  	setUserData(null);
			}
		};
		  
		fetchUserData();
	}, []);

	if (userData != null) {
		return (
			<div>
				<h1>Profile</h1>
				<UserDetails data={userData} />
			</div>
		);
	}
};

export default Profile;
