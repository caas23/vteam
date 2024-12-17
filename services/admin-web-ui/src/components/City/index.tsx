import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import CityTable from "../CityTable";
import { Bike, ChargingStation, City as CityInteface, ParkingZone, Rules } from "./interfaces";
import { fetchCityProps } from "../../fetchModels/fetchCityProps";
import { fetchOneCity } from "../../fetchModels/fetchOneCity";

const City: React.FC = () => {
  const { city } = useParams<{ city: string }>();
	const [currentCity, setCurrentCity] = useState<CityInteface | null>(null);
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

		document.title = `City ${currentCity.display_name} - Avec`;

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

	return (
		<div>
		<h1>{currentCity ? currentCity.display_name : ""}</h1>
		<CityTable rows={tableRows} />
		</div>
	);
};

export default City;
