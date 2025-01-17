import React, { useState, useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import { Bike } from "./interfaces";
import { Socket } from "socket.io-client";
import scooterIconBlue from "/src/assets/scooter-pin-blue.png";
import scooterIconGreen from "/src/assets/scooter-pin-green.png";
import scooterIconOrange from "/src/assets/scooter-pin-orange.png";
import scooterIconRed from "/src/assets/scooter-pin-red.png";
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
	const [openBikeId, setOpenBikeId] = useState<string | null>(null);
	const markerRefs = useRef<Map<string, L.Marker>>(new Map());

	const bikeIcon = (bike: Bike) => {
		if (bike.status.available) {
		  return L.icon({
			iconUrl: scooterIconBlue,
			iconSize: [40, 40],
			iconAnchor: [20, 45],
			popupAnchor: [0, -40],
		  });
		} else if (bike.status.battery_level > 30) {
		  return L.icon({
			iconUrl: scooterIconGreen,
			iconSize: [40, 40],
			iconAnchor: [20, 45],
			popupAnchor: [0, -40],
		  });
		} else if (bike.status.battery_level >= 15 && bike.status.battery_level <= 30) {
		  return L.icon({
			iconUrl: scooterIconOrange,
			iconSize: [40, 40],
			iconAnchor: [20, 45],
			popupAnchor: [0, -40],
		  });
		} else {
		  return L.icon({
			iconUrl: scooterIconRed,
			iconSize: [40, 40],
			iconAnchor: [20, 45],
			popupAnchor: [0, -40],
		  });
		}
	};

	const createClusterMarker = (className: string) => {
		return L.divIcon({
			className, 
			html: `<img src="${clusterIcon}" style="width: 55px; height: 55px; padding: 0.3em;" />`,
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

	useEffect(() => {
		if (openBikeId) {
		  const marker = markerRefs.current.get(openBikeId);
		  if (marker) {
			marker.openPopup();
		  }
		}
	}, [bikes]);

	const availableBikes = bikes.filter((bike) => bike.status.available);
	const inUseBikes = bikes.filter((bike) => !bike.status.available);

	return (
		<>
		<MarkerClusterGroup iconCreateFunction={() => createClusterMarker("bike-marker")}>
			{availableBikes.map((bike) => {
				return (
					<Marker
						key={bike.bike_id}
						position={bike.location}
						icon={bikeIcon(bike)}
						ref={(marker) => marker && markerRefs.current.set(bike.bike_id, marker)}
						eventHandlers={{
							popupopen: () => setOpenBikeId(bike.bike_id),
							popupclose: () => setOpenBikeId(null),
						}}
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
		
		{/* visa alltid separat utan cluster om cykeln används, detta för att
		minimera de upplevda "hopp" som uppstår när cyklar clustras/"av-clustras" */}
		{inUseBikes.map((bike) => {
			return (
			<Marker
				key={bike.bike_id}
				position={bike.location}
				icon={bikeIcon(bike)}
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
