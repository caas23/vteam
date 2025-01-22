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
import "./index.css";

/*** 
 *
 *  ATT FUNDERA PÅ (antingen för frontend- eller backend-hantering)
 * - Hur hantera resor som görs i realtid via appen, i denna vy? (nuvarande kod hanterar bara simulerade turer)
 * - Se till så att appen och denna vy samspelar väl i realtid (när någon hyr i app --> direkt spegling i denna vy)
 * 
 * ***/

const MapComponent: React.FC<BikeUsersProps> = ({ bikeUsers, socket }) => {
	const { city } = useParams<{ city: string }>();
	const [currentCity, setCurrentCity] = useState<CityInterface | null>(null);
	const [cityBorders, setCityBorders] = useState<any>(null);
	const [cityCenter, setCityCenter] = useState<[number, number] | null>(null);
	const [availableZones, setAvailableZones] = useState<ParkingZone[]>([]);
	const [availableStations, setAvailableStations] = useState<ChargingStation[]>([]);
	const [bikesInCity, setBikesInCity] = useState<Bike[]>([]);
	const [bikesInViewport, setBikesInViewport] = useState<Bike[]>([]);
	
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

	// kolla om cykeln är i viewporten för att enbart uppdatera dessa,
	// skapar dock viss fördröjning vid utzoomning, accepterbart?
	const isBikeInViewport = (bikeLocation: [number, number], bounds: L.LatLngBounds) => {
		const latLng = L.latLng(bikeLocation);
		return bounds.contains(latLng);
	};
	
	// måste vara en child component för att funka
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
			// uppdatera bara cyklar som är i nuvarande viewport
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
		
		socket.current?.on("bikeNotInUse", (data: { 
			bikeId: string;
			position: [number, number];
			battery: number;
		}) => {
			// uppdatera bara cyklar som är i nuvarande viewport
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
		<div className="return-content">
		<div className="map-div">
		<MapContainer center={cityCenter} zoom={12}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<ShowParkingZones zones={availableZones} />
			<ShowChargingStations stations={availableStations} />
			<ShowBikes bikes={bikesInCity} users={bikeUsers} socket={socket}/>
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
			<div className="color-codes">
				<div className="color-code">
					<img src={scooterIconBlue} alt="Blue Icon" className="color-icon" />
					<span> = Available</span>
				</div>
				<div className="color-code">
					<img src={scooterIconGreen} alt="Green Icon" className="color-icon" />
					<span> = In use, battery &gt; 30%</span>
				</div>
				<div className="color-code">
					<img src={scooterIconOrange} alt="Orange Icon" className="color-icon" />
					<span> = In use, battery 15% - 30%</span>
				</div>
				<div className="color-code">
					<img src={scooterIconRed} alt="Red Icon" className="color-icon" />
					<span> = In use, battery &lt; 15%</span>
				</div>
			</div>
		</div>
		</div>
		</>
	);
};

export default MapComponent;
