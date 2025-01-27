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
import scooterIconCharing from "/src/assets/scooter-pin-charging.png";
import scooterIconParking from "/src/assets/scooter-pin-parking.png";
import clusterIcon from "/src/assets/multiple-scooter-pin-blue.png";
import clusterIconCharging from "/src/assets/multiple-scooter-pin-charging.png";
import clusterIconParking from "/src/assets/multiple-scooter-pin-parking.png";
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
		if (bike.status.charging) {
		  return L.icon({
			iconUrl: scooterIconCharing,
			iconSize: [40, 40],
			iconAnchor: [20, 45],
			popupAnchor: [0, -40],
		  });
		} else if (bike.status.parking) {
		  return L.icon({
			iconUrl: scooterIconParking,
			iconSize: [40, 40],
			iconAnchor: [20, 45],
			popupAnchor: [0, -40],
		  });
		} else if (bike.status.available) {
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

	const activeCluster = () => {
		return L.divIcon({
			className: "bike-marker",
			html: `<img src="${clusterIcon}" style="width: 55px; height: 55px; padding: 0.3em;" />`,
			iconSize: [50, 50],
			iconAnchor: [25, 50],
			popupAnchor: [0, -40],
		});
	};
	
	const chargingCluster = () => {
		return L.divIcon({
			className: "bike-marker", 
			html: `<img src="${clusterIconCharging}" style="width: 55px; height: 55px; padding: 0.3em;" />`,
			iconSize: [50, 50],
			iconAnchor: [25, 50],
			popupAnchor: [0, -40],
		});
	};
	
	const parkingCluster = () => {
		return L.divIcon({
			className: "bike-marker", 
			html: `<img src="${clusterIconParking}" style="width: 55px; height: 55px; padding: 0.3em;" />`,
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

	const availableBikes = bikes.filter((bike) => bike.status.available && !bike.status.charging && !bike.status.parking);
	const inUseBikes = bikes.filter((bike) => !bike.status.available &&! bike.status.charging);
	const chargingBikes = bikes.filter((bike) => bike.status.charging);
	const parkingBikes = bikes.filter((bike) => bike.status.parking);

	const getBikeStatus = (bike: Bike) => {
		if (bike.status.charging) return "Charging";
		else if (bike.status.in_service) return "In Service";
		else if (bike.status.available) return "Available";
		else return "In use";
	};

	return (
		<>
		<MarkerClusterGroup iconCreateFunction={() => activeCluster()}>
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
						<strong>Status:</strong> {getBikeStatus(bike)}
					</Popup>
					</Marker>
				);
			})}
		</MarkerClusterGroup>
		
		{/* always show separately without cluster if the cycle is used, this is to
		minimize the perceived "jumps" that occur when cycles are clustered/"un-clustered" */}
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
		
		<MarkerClusterGroup iconCreateFunction={() => chargingCluster()}>
		{chargingBikes.map((bike) => {
			
			const remainingBattery = 100 - bike.status.battery_level;
			// 150 minutes to full charge, to align with setup running in the backend
			const timeLeftInMinutes = Math.ceil((remainingBattery / 100) * 150);

			return (
			<Marker
				key={bike.bike_id}
				position={bike.location}
				icon={bikeIcon(bike)}
			>
				<Popup>
				<strong>{bike.bike_id}</strong><br />
				<strong>Battery:</strong> {bike.status.battery_level.toFixed(2)}%<br />
				<strong>Status:</strong> {getBikeStatus(bike)}<br />
				<strong>Estimated time</strong><br />
				{timeLeftInMinutes > 1 ? (
					<><strong>left: </strong> {timeLeftInMinutes} minutes</>
				) : (
					<><strong>left: </strong> {timeLeftInMinutes} minute</>
				)}
				</Popup>
			</Marker>
			);
		})}
		</MarkerClusterGroup>

		<MarkerClusterGroup iconCreateFunction={() => parkingCluster()}>
			{parkingBikes.map((bike) => (
			<Marker
				key={bike.bike_id}
				position={bike.location}
				icon={bikeIcon(bike)}
			>
				<Popup>
				<strong>{bike.bike_id}</strong><br />
				<strong>Battery:</strong> {bike.status.battery_level}%<br />
				<strong>Status:</strong> {getBikeStatus(bike)}
				</Popup>
			</Marker>
			))}
      	</MarkerClusterGroup>


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
