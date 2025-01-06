import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import ShowParkingZones from "../ParkingZones";
import ShowChargingStations from "../ChargingStations";
import ShowBikes from "../Bikes";
import { City as CityInterface, ParkingZone, ChargingStation, Bike, Route, Trip } from "./interfaces";
import { fetchOneCity } from "../../fetchModels/fetchOneCity";
import { fetchCityProps } from "../../fetchModels/fetchCityProps";
import { fetchRoutes } from "../../fetchModels/fetchRoutes";
import io from "socket.io-client";
import "./index.css";

// fungerande kod än så länge
// kan flytta en cykel enligt en fördefinierad rutt,
// simulera en varierande hastighet med viss hänsyn till kurvor etc,
// parkera cykel, göra den tillgänglig, spara resan i db,
// lägga till resan i completed_trips för given cykel
// fungerar nu att lämna vyn/ladda om sidan utan att cyklarna
// försöker hämta en ny rutt (om de redan följer en)

// eventuellt, om jag har tid, kan logiken för bikeTrips och bikeRoutes justeras något,
// för att enbart låta t.ex. bikeRoutes styra om en cykel har en rutt eller inte, och enbart
// spara den informationen till localstorage, och inte använda bikeTrips för den logiken.

/*** 
 *
 *  ATT FUNDERA PÅ (antingen för frontend- eller backend-hantering)
 * - Hur simulera batteriåtgång? (vad är rimlig minskning per tidsenhet/hastighet?)
 * - Hur hantera resor som görs i realtid via appen, i denna vy? (nuvarande kod hanterar bara simulerade turer)
 * - Se till så att appen och denna vy samspelar väl i realtid (när någon hyr i app --> direkt spegling i denna vy)
 * - Hur klarar systemet en större load? (enbart testat för fåtal cyklar i samtidig rörelse)
 * 
 * ***/


const MapComponent: React.FC = () => {
	const { city } = useParams<{ city: string }>();
	const [currentCity, setCurrentCity] = useState<CityInterface | null>(null);
	const [cityBorders, setCityBorders] = useState<any>(null);
	const [cityCenter, setCityCenter] = useState<[number, number] | null>(null);
	const [availableZones, setAvailableZones] = useState<ParkingZone[]>([]);
	const [availableStations, setAvailableStations] = useState<ChargingStation[]>([]);
	const [bikesInCity, setBikesInCity] = useState<Bike[]>([]);
	const [routes, setRoutes] = useState<Route[]>([]);
	const [routesLoaded, setRoutesLoaded] = useState<boolean>(false);
	const socket = useRef<ReturnType<typeof io> | null>(null);

	// för att hålla koll på pågående rutter och resor, dels för att undvika att en 
	// cykel försöker följa flera rutter, dels för att kunna spara undan när resan är avslutad.
	const [bikeTrips, setBikeTrips] = useState<Map<string, Trip | null>>(new Map());
	const [bikeRoutes, setBikeRoutes] = useState<Map<string, Route | null>>(new Map());

	
	// hämta sparade (pågående) rutter för att undvika att en cykel försöker hämta en ny rutt
	useEffect(() => {
		const savedTrips = new Map<string, Trip | null>(
			Object.entries(JSON.parse(localStorage.getItem("bikeTrips") || "{}")).map(
				([key, value]) => [key, value as Trip | null]
			)
		);
		const savedRoutes = new Map<string, Route | null>(
			Object.entries(JSON.parse(localStorage.getItem("bikeRoutes") || "{}")).map(
				([key, value]) => [key, value as Route | null]
			)
		);
		setBikeTrips(savedTrips);
		setBikeRoutes(savedRoutes);
	}, []);

	// uppdatera localstorage när bikeTrips eller bikeRoutes ändras
	useEffect(() => {
		localStorage.setItem("bikeTrips", JSON.stringify(Object.fromEntries(bikeTrips)));
	}, [bikeTrips]);
	
	useEffect(() => {
		localStorage.setItem("bikeRoutes", JSON.stringify(Object.fromEntries(bikeRoutes)));
	}, [bikeRoutes]);

	useEffect(() => {
		if (!socket.current) {
			socket.current = io("http://localhost:1337");
		}

		return () => {
			if (socket.current) {
				socket.current.disconnect();
				socket.current = null;
			}
		};
	}, []);

	useEffect(() => {
		const fetchAndSetRoutes = async () => {
			try {
				const result = await fetchRoutes();
				setRoutes(result);
				setRoutesLoaded(true);
			} catch (error) {
				console.error("Failed to fetch routes:", error);
				setRoutesLoaded(true);
			}
		};
		fetchAndSetRoutes();
	}, []);

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
		if (!currentCity || !routesLoaded) return;

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
		
		city ? fetchCityBorders(city) : "";

		const fetchAndSetBikes = async () => {
			try {
				const bikes = await fetchCityProps(currentCity.display_name || "", "bikes");
				setBikesInCity(bikes);
			} catch (error) {
				console.error("Could not fetch bikes:", error);
			}
		};
		fetchAndSetBikes();

		socket.current?.on("bikeInUse", (data: { bikeId: string; position: [number, number]; speed: number }) => {
			setBikesInCity((prevBikes) =>
				prevBikes.map((bike) =>
					bike.bike_id === data.bikeId ? { ...bike, location: data.position, speed: data.speed } : bike
				)
			);
		});

		return () => {
			socket.current?.off("bikeInUse");
		};
	}, [currentCity, city, routesLoaded]);

	// hämta en rutt genom att matcha nuvaranda position
	// mot antingen första eller sista koordinaterna för en rutt.
	const findRoute = useMemo(() => {
		return (bikeLocation: [number, number]) => {
			const matchingRoute = routes.find(
				(route) => route.route?.[0]?.[0] === bikeLocation[0] && route.route?.[0]?.[1] === bikeLocation[1]
			);
			if (matchingRoute) return matchingRoute;
			const reverseMatchingRoute = routes.find(
				(route) =>
					route.route?.[route.route.length - 1]?.[0] === bikeLocation[0] &&
					route.route?.[route.route.length - 1]?.[1] === bikeLocation[1]
			);
			if (reverseMatchingRoute) {
				return {
					...reverseMatchingRoute,
					route: reverseMatchingRoute.route.reverse(),
				};
			}
		};
	}, [routes]);


  	// kolla om en cykel har avslutat en rutt genom att jämföra dess position med sista koordinaterna för rutten
	const hasCompletedRoute = (bike: Bike, route: Route) => {
		const lastPoint = route.route[route.route.length - 1];
		return bike.location[0] === lastPoint[0] && bike.location[1] === lastPoint[1];
	};

	useEffect(() => {
		// invänta rutter och eventuellt sparade rutter och resor
		if (!routesLoaded || !bikeTrips || !bikeRoutes) return;
	  
		bikesInCity.forEach((bike) => {
			// hämta sparade rutter om de finns
			const bikeTrip = bikeTrips.get(bike.bike_id);
			const bikeRoute = bikeRoutes.get(bike.bike_id);
			
			// om en rutt är avslutad, spara undan detaljer i db och ta bort från 
			// temporärt sparade rutter/resor i localstorage
			if (bikeTrip && bikeRoute && hasCompletedRoute(bike, bikeRoute)) {
				// beräkna total tid och pris för att skicka med till backenden
				const endTime = new Date();
				const startTime = new Date(bikeTrip.start_time || endTime);
				const totalTimeMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
				const price = (totalTimeMinutes * 2.5 + 10).toFixed(2);
		
				// använd socket för att alerta backenden att resan ska sparas
				// i backenden kommer även en slumpmässig användare
				// behöva hämtas, för att koppla genomförd resa till en användare
				socket.current?.emit("finishRoute", {
					bike: bike,
					trip: {
						start_time: bikeTrip.start_time,
						end_time: endTime,
						start_location: bikeTrip.start_location,
						end_location: bike.location,
						price,
						route: bikeRoute.route,
						distance: bikeRoute.distance,
					},
				});
		
				// efter genomförd resa tas temporärt sparad data bort från localstorage
				setBikeTrips((prev) => {
					const updatedTrips = new Map(prev);
					updatedTrips.delete(bike.bike_id);
					return updatedTrips;
				});
		
				setBikeRoutes((prev) => {
					const updatedRoutes = new Map(prev);
					updatedRoutes.delete(bike.bike_id);
					return updatedRoutes;
				});
		
				// cykeln gör tillgänglig igen
				setBikesInCity((prevBikes) =>
					prevBikes.map((b) =>
						b.bike_id === bike.bike_id
						? { ...b, status: { ...b.status, available: true } }
						: b
					)
				);
		
		
			} else {
				// hämta en resa enbart om cykeln är upptagen
				// men inte har någon rutt kopplad till sig ännu
				if (!bikeTrip && !bike.status.available) {
					const matchedRoute = findRoute(bike.location);
			
					if (matchedRoute) {
						const startTime = new Date();
			
						// spara temporärt rutten i localstorage 
						// (används för att undvika dubbelfetchning om sidan lämnas/laddas om)
						setBikeRoutes((prev) => {
							const updatedRoutes = new Map(prev);
							updatedRoutes.set(bike.bike_id, matchedRoute);
							return updatedRoutes;
						});
			
						const trip: Trip = {
							start_time: startTime,
							end_time: new Date(),
							start_location: bike.location,
							end_location: bike.location,
							price: 0,
							route: matchedRoute.route,
							distance: matchedRoute.distance,
						};
			
						// spara temporärt resan i localstorage 
						// (används för att undvika dubbelfetchning om sidan lämnas/laddas om)
						setBikeTrips((prev) => {
							const updatedTrips = new Map(prev);
							updatedTrips.set(bike.bike_id, trip);
							return updatedTrips;
						});
			
						socket.current?.emit("startbikeInUse", {
							bikeId: bike.bike_id,
							route: matchedRoute.route,
						});
					}
				}
		 	}
		});
	}, [bikesInCity, routesLoaded, bikeTrips, bikeRoutes]);
	  

	if (!cityCenter) {
		return (
			<div>
				<h1>{currentCity ? currentCity.display_name : ""}</h1>
				<p className="map-loading-msg">Loading map ...</p>
			</div>
		);
	}

	return (
		<MapContainer center={cityCenter} zoom={12}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<ShowParkingZones zones={availableZones} />
			<ShowChargingStations stations={availableStations} />
			<ShowBikes bikes={bikesInCity} />
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
	);
};

export default MapComponent;
