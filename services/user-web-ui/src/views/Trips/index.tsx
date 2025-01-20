import React, { useEffect, useState } from "react";
import "./index.css";
import { Trips as TripsInterface } from "./interfaces";
import TripDetails from "./tripDetails";
import { fetchOneUserByGitId } from "../../fetchModels/fetchOneUser";

const Trips: React.FC = () => {
	const [completedTrips, setCompletedTrips] = useState< TripsInterface | null | undefined >(undefined);

	const storedUser = sessionStorage.getItem("user");
	const gitId = storedUser && JSON.parse(storedUser).id

	useEffect(() => {
		document.title = "Trips - Solo Scoot";

		const fetchUserData = async () => {
			try {
				const result = await fetchOneUserByGitId(gitId);
				setCompletedTrips(result[0].completed_trips);
			} catch {
				setCompletedTrips(null);
			}
		};
			
		fetchUserData();
	}, []);
	
	if (completedTrips != null) {
		return (
			<div>
				<h1>Trips</h1>
				<TripDetails trips={completedTrips} />
			</div>
		);
	}
};

export default Trips;
