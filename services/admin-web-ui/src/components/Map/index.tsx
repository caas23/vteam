import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import ShowParkingZones from "../ParkingZones";
import ShowChargingStations from "../ChargingStations";
import ShowBikes from "../Bikes";
import { City as CityInterface, ParkingZone, ChargingStation, Bike } from "./interfaces";
import { fetchOneCity } from "../../fetchModels/fetchOneCity";
import { fetchCityProps } from "../../fetchModels/fetchCityProps";
import "./index.css";


const Map: React.FC = () => {
	const { city } = useParams<{ city: string }>();
	const [currentCity, setCurrentCity] = useState<CityInterface | null>(null);
	const [cityBorders, setCityBorders] = useState<any>(null);
	const [cityCenter, setCityCenter] = useState<[number, number] | null>(null);
	const [availableZones, setAvailableZones] = useState<ParkingZone[]>([]);
	const [availableStations, setAvailableStations] = useState<ChargingStation[]>([]);
	const [bikesInCity, setBikesInCity] = useState<Bike[]>([]);

	useEffect(() => {	
		const fetchAndSetCity = async () => {
			const result = await fetchOneCity(city ? city : "");
			setCurrentCity(result);
		};
		fetchAndSetCity();

		const fetchAndSetParkingZones = async () => {
		try {
			const parkingZones = await fetchCityProps(city ? city : "", "parking");
			setAvailableZones(parkingZones);
		} catch (error) {
			console.error("Could not fetch parking zones:", error);
		}
		};
		fetchAndSetParkingZones();
		
		const fetchAndSetChargingStations = async () => {
		try {
			const chargingStations = await fetchCityProps(city ? city : "", "charging");
			setAvailableStations(chargingStations);
		} catch (error) {
			console.error("Could not fetch charging stations:", error);
		}
		};
		fetchAndSetChargingStations();
		
	}, [city]);

	useEffect(() => {
		// hämta nuvaranda stad innan resten av datan hämtas
		if (!currentCity) return;

		document.title = `Map ${currentCity.display_name} - Avec`;

		const fetchCityBorders = async (cityName: string) => {
			try {
				const response = await fetch(
					`https://nominatim.openstreetmap.org/search.php?q=${cityName}&polygon_geojson=1&format=json`
				);
				console.log(response)
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
		
		city ? fetchCityBorders(city) : "";


		const fetchAndSetBikes = async () => {
			try {
				const bikes = await fetchCityProps(currentCity ? currentCity.display_name : "", "bikes");
				setBikesInCity(bikes);
			} catch (error) {
				console.error("Could not fetch bikes:", error);
			}
			};
			fetchAndSetBikes();

	}, [currentCity]);

	// för att hinna hämta cityCenter och
	// få kartan centrerad kring önskat område.
	// tar egentligen bara någon ms men krävs för
	// att kunna sköta kartritningen på smidigt sätt.
  	if (!cityCenter) {
		return (
			<div>
				<h1>{currentCity ? currentCity.display_name : ""}</h1>
				<p className="map-loading-msg">Loading map ...</p>
			</div>
		);
	}

	return (
		<div>
			<h1>{currentCity ? currentCity.display_name : ""}</h1>
			<MapContainer center={cityCenter} zoom={12}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
		        <ShowParkingZones zones={availableZones} />
		        <ShowChargingStations stations={availableStations} />
				<ShowBikes bikes={bikesInCity} />

				{/* <MarkerClusterGroup>
				{availableZones.map((zone) => {
					const center = calculateCentroid(zone.area);
					return (
					<Marker
						key={zone.parking_id}
						icon={parkingZoneMarker}
						position={center}
					>
						<Popup>{zone.parking_id}</Popup>
					</Marker>
					);
				})}

				{availableStations.map((station) => {
					const center = calculateCentroid(station.area);
					return (
					<Marker
						key={station.charging_id}
						icon={chargingStationMarker}
						position={center}
					>
						<Popup>{station.charging_id}</Popup>
					</Marker>
					);
				})}
				</MarkerClusterGroup> */}

				{cityBorders && (
					<GeoJSON
						data={cityBorders}
						style={{
							color: "#1A4D30", // --color-blue-darker
							weight: 1.5,
							fillOpacity: 0.0,
						}}
					/>
				)};
			</MapContainer>
		</div>
	);
}


export default Map;
