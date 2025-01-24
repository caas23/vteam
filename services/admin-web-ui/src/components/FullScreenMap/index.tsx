import React from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import ShowParkingZones from "../ParkingZones";
import ShowChargingStations from "../ChargingStations";
import ShowBikes from "../Bikes";
import { FullScreenMapProps } from "./interfaces";
import "./index.css";

const FullScreenMap: React.FC<FullScreenMapProps> = ({
	boxOpen,
	onClose,
	cityCenter,
	cityBorders,
	bikes,
	users,
	socket,
	availableZones,
	availableStations,
	filters,
}) => {
  	if (!boxOpen) return null;

	const filteredBikes = bikes.filter((bike) => {
		if (bike.status.charging && filters.charging) return true;
		if (bike.status.parking && filters.parking) return true;
		if (!bike.status.parking && bike.status.available && filters.available) return true;
		if (!bike.status.available && !bike.status.charging && !bike.status.in_service) {
		if (bike.status.battery_level > 30 && filters.green) return true;
		if (bike.status.battery_level <= 30 && bike.status.battery_level > 15 && filters.orange)
			return true;
		if (bike.status.battery_level <= 15 && filters.red) return true;
		}
		return false;
	});

	return (
		<div className="fullscreen-map-container">
			<button className="close-fullscreen" onClick={onClose}>
				Close fullscreen
			</button>
			<MapContainer center={cityCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
				<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<ShowParkingZones zones={availableZones} />
				<ShowChargingStations stations={availableStations} />
				<ShowBikes bikes={filteredBikes} users={users} socket={socket} />
				{cityBorders && (
				<GeoJSON
					data={cityBorders}
					style={{
					color: "#1A4D30",
					weight: 1.5,
					fillOpacity: 0.0,
					}}
				/>
				)}
			</MapContainer>
		</div>
	);
};

export default FullScreenMap;
