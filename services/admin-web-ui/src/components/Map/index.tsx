import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import scooterIcon from "/src/assets/scooter-pin.png";
import chargingIcon from "/src/assets/charging-station.png";
import parkingIcon from "/src/assets/parking-spot.png";
import "./index.css";


const Map: React.FC = () => {
	const { city } = useParams<{ city: string }>();
	const [cityBorders, setCityBorders] = useState<any>(null);
	const [cityCenter, setCityCenter] = useState<[number, number] | null>(null);

	// ett sätt att bibehålla å, ä och ö när vi skriver ut stadens namn,
	// nackdel: behöva lägga in städer manuellt, fördel: smidig lösning
	// får fundera på bra lösning senare när db kommer in i bilden
	const cityNameDisplay: { [key: string]: string } = {
		lund: "Lund",
		solna: "Solna",
		skelleftea: "Skellefteå",
	};

	const scooterMarker = L.icon({
		iconUrl: scooterIcon,
		iconSize: [50, 50],
		iconAnchor: [25, 50],
		popupAnchor: [0, -40],
	});

	// Ikoner för laddstationer och parkeringar att använda när vi är redo
	const chargingStationMarker = L.icon({
		iconUrl: chargingIcon,
		iconSize: [30, 30],
		iconAnchor: [15, 30],
		popupAnchor: [1, -20],
	});

	const parkingSpotMarker = L.icon({
		iconUrl: parkingIcon,
		iconSize: [30, 30],
		iconAnchor: [15, 30],
		popupAnchor: [1, -20],
	});

	useEffect(() => {
		document.title = city ? `Map ${cityNameDisplay[city]} - Avec` : 'Map - Avec';

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

	}, [city]);

	// för att hinna hämta cityCenter och
	// få kartan centrerad kring önskat område.
	// tar egentligen bara någon ms men krävs för
	// att kunna sköta kartritningen på smidigt sätt.
  	if (!cityCenter) {
		return (
			<div>
				<h1>{city ? cityNameDisplay[city] : ""}</h1>
				<p className="map-loading-msg">Loading map ...</p>
			</div>
		);
	}

	return (
		<div>
			<h1>{city ? cityNameDisplay[city] : ""}</h1>
			<MapContainer center={cityCenter} zoom={12}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{cityBorders && (
					<GeoJSON
						data={cityBorders}
						style={{
							color: "#1A4D30", // --color-green-darker
							weight: 1.5,
							fillOpacity: 0.0,
						}}
					/>
				)};
				<Marker position={cityCenter} icon={scooterMarker}>
					<Popup>
						Vi kan använda popups som dessa för <br />
						cyklar, laddstationer och parkeringar. <br />
						Men med custom ikoner för vardera del.
					</Popup>
				</Marker>
			</MapContainer>
		</div>
	);
}


export default Map;
