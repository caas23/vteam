import React, { useState } from "react";
import { Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import { Bike } from "./interfaces";
import { Socket } from "socket.io-client";
import scooterIcon from "/src/assets/scooter-pin-blue.png";
import clusterIcon from "/src/assets/multiple-scooter-pin-blue.png";
import ForceStopMessage from "../ForceStopMessage";
import "./index.css";

const ShowBikes: React.FC<{ 
	bikes: Bike[], 
	users: Map<string, string | null>, 
	socket: React.MutableRefObject<Socket | null>;
}> = ({ bikes, users, socket }) => {
	const [forceStopMessage, setForceStopMessage] = useState("");
	const [alertBox, setAlertBox] = useState(false);
	const [currentBike, setCurrentBike] = useState<Bike | null>(null);

	const bikeMarker = L.icon({
		iconUrl: scooterIcon,
		iconSize: [50, 50],
		iconAnchor: [25, 50],
		popupAnchor: [0, -40],
	});

	const createClusterMarker = () => {
		return L.icon({
		iconUrl: clusterIcon,
		iconSize: [50, 50],
		iconAnchor: [25, 50],
		popupAnchor: [0, -40],

		});
	};

	const createCustomMarker  = (className: string) => {
		return L.divIcon({
		className,
		html: `<img src="${scooterIcon}" style="width: 50px; height: 50px; padding: 0.3em;" />`,
		iconSize: [50, 50],
		iconAnchor: [25, 50],
		popupAnchor: [0, -40],
		});
	};

	const handleForceStop = (bike: Bike) => {
		setCurrentBike(bike);
		setForceStopMessage(`for bike ${bike.bike_id}, rented by user ${users.get(bike.bike_id)}`);
		setAlertBox(true);
	};

	const handleSubmitReason = (reason: string) => {
		if (currentBike) {
			const user = users.get(currentBike.bike_id);
			socket.current?.emit("forceStop", { bike: currentBike, reason, user: user });
			setAlertBox(false);
			setCurrentBike(null);
		}
	};

	const availableBikes = bikes.filter((bike) => bike.status.available);
	const inUseBikes = bikes.filter((bike) => !bike.status.available);

	return (
		<>
		<MarkerClusterGroup iconCreateFunction={() => createClusterMarker()}>
			{availableBikes.map((bike) => {
				const lowBattery = bike.status.battery_level < 20;
				const className = lowBattery ? "bike-available-low-battery" : "bike-marker";
				return (
					<Marker
					key={bike.bike_id}
					position={bike.location}
					icon={lowBattery ? createCustomMarker(className) : bikeMarker}
					>
					<Popup>
						<strong>{bike.bike_id}</strong><br />
						<strong>Battery:</strong> {bike.status.battery_level}%<br />
						<strong>Status:</strong> {bike.status.available ? "Available" : "In use"}
					</Popup>
					</Marker>
				);
			})}
		</MarkerClusterGroup>
		
		{/* om cykeln används, visa alltid separat utan cluster (problematiskt om alla används?) */}
		{inUseBikes.map((bike) => {
			const lowBattery = bike.status.battery_level < 20;
			const className = lowBattery ? "bike-in-use-low-battery" : "bike-in-use-marker";

			return (
			<Marker
				key={bike.bike_id}
				position={bike.location}
				icon={createCustomMarker(className)}
			>
				<Popup>
					<strong>{bike.bike_id}</strong><br />
					<strong>Speed:</strong> {bike.speed} km/h<br />
					<strong>Battery:</strong> {bike.status.battery_level}%<br />
					<strong>Status:</strong> {bike.status.available ? "Available" : "In use"}<br />
					<strong>User:</strong> {users.get(bike.bike_id)}<br />
					<button className="force-stop-btn" onClick={() => handleForceStop(bike)}>Force stop</button>
				</Popup>
			</Marker>
			);
			})}
			<ForceStopMessage
				boxOpen={alertBox}
				onClose={() => setAlertBox(false)}
				message={forceStopMessage}
				onSubmitReason={handleSubmitReason}
			/>
		</>
	);
};

export default ShowBikes;
