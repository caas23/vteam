import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import ShowParkingZones from "../ParkingZones";
import ShowChargingStations from "../ChargingStations";
import ShowBikes from "../Bikes";
import { City as CityInterface, ParkingZone, ChargingStation, Bike, BikeUsersProps } from "./interfaces";
import { fetchOneCity } from "../../fetchModels/fetchOneCity";
import { fetchCityProps } from "../../fetchModels/fetchCityProps";
import scooterIconBlue from "/src/assets/scooter-pin-blue.png";
import scooterIconGreen from "/src/assets/scooter-pin-green.png";
import scooterIconOrange from "/src/assets/scooter-pin-orange.png";
import scooterIconRed from "/src/assets/scooter-pin-red.png";
import scooterIconCharging from "/src/assets/scooter-pin-charging.png";
import scooterIconParking from "/src/assets/scooter-pin-parking.png";
import clusterIcon from "/src/assets/multiple-scooter-pin-blue.png";
import clusterIconCharging from "/src/assets/multiple-scooter-pin-charging.png";
import clusterIconParking from "/src/assets/multiple-scooter-pin-parking.png";
import FullScreenMap from "../FullScreenMap";
import "./index.css";

const MapComponent: React.FC<BikeUsersProps> = ({ bikeUsers, socket }) => {
	const { city } = useParams<{ city: string }>();
	const [currentCity, setCurrentCity] = useState<CityInterface | null>(null);
	const [cityBorders, setCityBorders] = useState<any>(null);
	const [cityCenter, setCityCenter] = useState<[number, number] | null>(null);
	const [availableZones, setAvailableZones] = useState<ParkingZone[]>([]);
	const [availableStations, setAvailableStations] = useState<ChargingStation[]>([]);
	const [bikesInCity, setBikesInCity] = useState<Bike[]>([]);
	const [bikesInViewport, setBikesInViewport] = useState<Bike[]>([]);
	const [bigMapOpen, setBigMapOpen] = useState(false);

	// to be able to filter by category (battery level, parking etc)
	const [filters, setFilters] = useState({
        available: true,
        green: true,
        orange: true,
        red: true,
        charging: true,
        parking: true,
    });
	
	useEffect(() => {
		const fetchAndSetCity = async () => {
			const result = await fetchOneCity(city || "");
			setCurrentCity(result);
		};
		fetchAndSetCity();

		const fetchAndSetParkingZones = async () => {
			try {
				const parkingZones = await fetchCityProps(city || "", "parking");
				setAvailableZones(parkingZones);
			} catch (error) {
				console.error("Could not fetch parking zones:", error);
			}
		};
		fetchAndSetParkingZones();

		const fetchAndSetChargingStations = async () => {
			try {
				const chargingStations = await fetchCityProps(city || "", "charging");
				setAvailableStations(chargingStations);
			} catch (error) {
				console.error("Could not fetch charging stations:", error);
			}
		};
		fetchAndSetChargingStations();
	}, [city]);

	useEffect(() => {
		if (!currentCity) return;

		document.title = `Map ${currentCity.display_name} - Solo Scoot`;

		const fetchCityBorders = async (cityName: string) => {
			try {
				const response = await fetch(
					`https://nominatim.openstreetmap.org/search.php?q=${cityName}&polygon_geojson=1&format=json`
				);
				if (!response.ok) {
					throw new Error(`Error: ${response.statusText}`);
				}

				const data = await response.json();
				if (data?.[0]?.geojson) {
					setCityBorders(data[0].geojson);
					setCityCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
				} else {
					console.error("No city data found.");
				}
			} catch (error) {
				console.error("Error fetching city data:", error);
			}
		};
		
		city && fetchCityBorders(city);

		const fetchAndSetBikes = async () => {
			try {
				const bikes = await fetchCityProps(currentCity.display_name || "", "bikes");
				setBikesInCity(bikes);
			} catch (error) {
				console.error("Could not fetch bikes:", error);
			}
		};
		fetchAndSetBikes();

	}, [currentCity]);

	// to be able to filter by category (battery level, parking etc)
	const filteredBikes = bikesInCity.filter((bike) => {
		if (bike.status.charging && filters.charging) return true;
		if (bike.status.parking && filters.parking) return true;
        if (!bike.status.parking && bike.status.available && filters.available) return true;
        if (!bike.status.available && !bike.status.charging && !bike.status.in_service) {
            if (bike.status.battery_level > 30 && filters.green) return true;
            if (bike.status.battery_level <= 30 && bike.status.battery_level > 15 && filters.orange) return true;
            if (bike.status.battery_level <= 15 && filters.red) return true;
        }
        return false;
    });

	const toggleFilter = (key: keyof typeof filters) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [key]: !prevFilters[key],
        }));
    };

	// check if the bike is in the viewport to only update these
	const isBikeInViewport = (bikeLocation: [number, number], bounds: L.LatLngBounds) => {
		const latLng = L.latLng(bikeLocation);
		return bounds.contains(latLng);
	};
	
	// has to be a child component to work
	const BikeViewportUpdater: React.FC = () => {
		const map = useMap();
		useMapEvent('moveend', () => {
			const bounds = map.getBounds();
			const bikesInView = bikesInCity.filter(bike => isBikeInViewport(bike.location, bounds));
			setBikesInViewport(bikesInView);
		});
		return null;
	};

	useEffect(() => {
		if (!socket.current) return;

		socket.current?.emit("mapConnected");

		socket.current?.on("bikeInUse", (data: { 
			bikeId: string;
			position: [number, number];
			speed: number;
			battery: number;
		}) => {
			// only update bikes that are in the current viewport
			if (bikesInViewport.some(bike => bike.bike_id === data.bikeId)) {
				setBikesInCity(prevBikes =>
					prevBikes.map(bike =>
						bike.bike_id === data.bikeId ? { 
							...bike,
							location: data.position,
							speed: data.speed,
							status: {
								...bike.status,
								battery_level: data.battery,
								available: false
							}
						} : bike
					)
				);
			}
		});
		
		socket.current?.on("chargingStatus", (data: { 
			bikeId: string;
			battery: number;
		}) => {
			// only update bikes that are in the current viewport
			if (bikesInViewport.some(bike => bike.bike_id === data.bikeId)) {
				setBikesInCity(prevBikes =>
					prevBikes.map(bike =>
						bike.bike_id === data.bikeId ? { 
							...bike,
							status: {
								...bike.status,
								battery_level: data.battery,
							}
						} : bike
					)
				);
			}
		});
		
		socket.current?.on("chargingFinished", (data: { 
			bikeId: string;
			location: [number, number];
		}) => {
			// only update bikes that are in the current viewport
			if (bikesInViewport.some(bike => bike.bike_id === data.bikeId)) {
				setBikesInCity(prevBikes =>
					prevBikes.map(bike =>
						bike.bike_id === data.bikeId ? { 
							...bike,
							location: data.location,
							status: {
								...bike.status,
								available: true,
								battery_level: 100,
								parking: true,
								charging: false
							}
						} : bike
					)
				);
			}
		});
		
		socket.current?.on("bikeNotInUse", (data: { 
			bikeId: string;
			position: [number, number];
			battery: number;
		}) => {
			// only update bikes that are in the current viewport
			if (bikesInViewport.some(bike => bike.bike_id === data.bikeId)) {
				setBikesInCity(prevBikes =>
					prevBikes.map(bike =>
						bike.bike_id === data.bikeId ? { 
							...bike,
							location: data.position,
							speed: 0,
							status: {
								...bike.status,
								battery_level: data.battery,
								available: true 
							}
						} : bike
					)
				);
			}
		});


		return () => {
			socket.current?.off("bikeInUse");
			socket.current?.off("bikeNotInUse");
			socket.current?.emit("mapDisconnected");
		};
	}, [bikesInViewport, socket]);

	if (!cityCenter) {
		return (
			<>
			<h1>{currentCity ? currentCity.display_name : ""}</h1>
			<div className="map-loading">
				<p className="map-loading-msg">Loading map ...</p>
			</div>
			</>
		);
	}

	return (
		<>
		<h1>{currentCity ? currentCity.display_name : ""}</h1>
		<button className="fullscreen-toggle" onClick={() => setBigMapOpen(true)}>
			Fullscreen mode
		</button>
		<div className="return-content">
		<div className="map-div">
		<MapContainer center={cityCenter} zoom={12}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<ShowParkingZones zones={availableZones} />
			<ShowChargingStations stations={availableStations} />
			<ShowBikes bikes={filteredBikes} users={bikeUsers} socket={socket}/>
			{cityBorders && (
				<GeoJSON
					data={cityBorders}
					style={{
						color: "#1A4D30", // --color-blue-darker
						weight: 1.5,
						fillOpacity: 0.0,
					}}
				/>
			)}
			<BikeViewportUpdater />
		</MapContainer>
		</div>
		<div className="color-div">
			<h2>Color codes</h2>
			<span className="color-code-msg">Use the checkboxes to filter bikes</span>
			<div className="color-codes">
				<div className="color-code">
					<input
						type="checkbox"
						checked={filters.green}
						onChange={() => toggleFilter("green")}
					/>
					<img src={scooterIconGreen} alt="Green Icon" className="color-icon" />
					<span> = In use, battery &gt; 30%</span>
				</div>
				<div className="color-code">
					<input
						type="checkbox"
						checked={filters.orange}
						onChange={() => toggleFilter("orange")}
					/>
					<img src={scooterIconOrange} alt="Orange Icon" className="color-icon" />
					<span> = In use, battery 15% - 30%</span>
				</div>
				<div className="color-code">
					<input
						type="checkbox"
						checked={filters.red}
						onChange={() => toggleFilter("red")}
					/>
					<img src={scooterIconRed} alt="Red Icon" className="color-icon" />
					<span> = In use, battery &lt; 15%</span>
				</div>
				<div className="color-code">
					<input
						type="checkbox"
						checked={filters.available}
						onChange={() => toggleFilter("available")}
					/>
					<img src={clusterIcon} alt="Blue Icon" className="color-icon" />
					<img src={scooterIconBlue} alt="Blue Icon" className="color-icon" />
					<span> = Available</span>
				</div>
				<div className="color-code">
					<input
						type="checkbox"
						checked={filters.charging}
						onChange={() => toggleFilter("charging")}
					/>
					<img src={clusterIconCharging} alt="Charging Icon" className="color-icon" />
					<img src={scooterIconCharging} alt="Charging Icon" className="color-icon" />
					<span> = Charging</span>
				</div>
				<div className="color-code">
					<input
						type="checkbox"
						checked={filters.parking}
						onChange={() => toggleFilter("parking")}
					/>
					<img src={clusterIconParking} alt="Parking Icon" className="color-icon" />
					<img src={scooterIconParking} alt="Parking Icon" className="color-icon" />
					<span> = Parking</span>
				</div>
			</div>
		</div>
		</div>
		<FullScreenMap
			boxOpen={bigMapOpen}
			onClose={() => setBigMapOpen(false)}
			cityCenter={cityCenter}
			cityBorders={cityBorders}
			bikes={bikesInCity}
			users={bikeUsers}
			socket={socket}
			availableZones={availableZones}
			availableStations={availableStations}
			filters={filters}
		/>
		</>
	);
};

export default MapComponent;
