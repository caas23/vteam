import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import CityTable from "../CityTable";
import { Bike, ChargingStation, City as CityInterface, ParkingZone, Rules } from "./interfaces";
import { fetchCityProps } from "../../fetchModels/fetchCityProps";
import { fetchOneCity } from "../../fetchModels/fetchOneCity";

const City: React.FC = () => {
  	const { city } = useParams<{ city: string }>();
	const [currentCity, setCurrentCity] = useState<CityInterface | null>(null);
	const [bikes, setBikes] = useState<Bike[]>([]);
	const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
	const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);
	const [rules, setRules] = useState<Rules[]>([]);

	useEffect(() => {	
		const fetchAndSetCity = async () => {
			const result = await fetchOneCity(city ? city : "");
			setCurrentCity(result);
		};
		fetchAndSetCity();
	}, [city]);

	useEffect(() => {
		// hämta nuvaranda stad innan resten av datan hämtas
		if (!currentCity) return;

		document.title = `City ${currentCity.display_name} - Solo Scoot`;

		const fetchAndSetBikes = async () => {
			const result = await fetchCityProps(currentCity ? currentCity.display_name : "", "bikes");
			setBikes(result);
		};
		
		const fetchAndSetCharging = async () => {
			const result = await fetchCityProps(city ? city : "", "charging");
			setChargingStations(result);
		};
		
		const fetchAndSetParking = async () => {
			const result = await fetchCityProps(city ? city : "", "parking");
			setParkingZones(result);
		};
		
		const fetchAndSetRules = async () => {
			const result = await fetchCityProps(city ? city : "", "rules");
			setRules(result);
		};
		
		fetchAndSetBikes();
		fetchAndSetCharging();
		fetchAndSetParking();
		fetchAndSetRules();
	}, [currentCity]);

	const tableRows = [
		{ category: "Bikes", count: bikes.length, data: bikes },
		{ category: "Charging Stations", count: chargingStations.length, data: chargingStations },
		{ category: "Parking Zones", count: parkingZones.length, data: parkingZones },
		{ category: "Rules", count: rules.length, data: rules },
	];

	// för att uppdatera tabellen så fort något raderas, utan sidomladdning
	const handleDelete = (category: string, id: string) => {
		switch (category) {
		  case "Bikes":
			setBikes((prevBikes) => prevBikes.filter((bike) => bike.bike_id !== id));
			break;
		  case "Charging Stations":
			setChargingStations((prevStations) => prevStations.filter((station) => station.charging_id !== id));
			break;
		  case "Parking Zones":
			setParkingZones((prevZones) => prevZones.filter((zone) => zone.parking_id !== id));
			break;
		  case "Rules":
			setRules((prevRules) => prevRules.filter((rule) => rule.rule_id !== id));
			break;
		  default:
			break;
		}
	};

	return (
		<div>
		<h1>{currentCity ? currentCity.display_name : ""}</h1>
		<CityTable
			rows={tableRows} 
			onDelete={handleDelete}
		/>
		</div>
	);
};

export default City;
