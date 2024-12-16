import React , { useEffect, useState } from "react";
import { MapContainer, CircleMarker, Popup, TileLayer, Polyline } from "react-leaflet";
import polyline from "@mapbox/polyline";
import { TripMapProps } from "./interfaces";

const TripMap: React.FC<TripMapProps> = ({ startLocation, endLocation, FetchedDistance }) => {
    const [route, setRoute] = useState<[number, number][]>([]);
    const mapCenter: [number, number] = [
        (startLocation[0] + endLocation[0]) / 2,
        (startLocation[1] + endLocation[1]) / 2,
    ];

    const API_KEY = import.meta.env.VITE_API_KEY;

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const coordinates = [
                    [startLocation[1], startLocation[0]],
                    [endLocation[1], endLocation[0]],
                ];

                const response = await fetch(
                    "https://api.openrouteservice.org/v2/directions/cycling-electric",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: API_KEY,
                        },
                        body: JSON.stringify({ coordinates }),
                    }
                );
                
                if (!response.ok) {
                    throw new Error("Could not fetch route");
                }
                
                const data = await response.json();

                if (data.routes && data.routes[0]?.geometry) {
                    const encodedRoute = data.routes[0].geometry;
                    const decodedRoute = polyline.decode(encodedRoute);
                    setRoute(decodedRoute);

                    if (data.routes[0]?.summary?.distance) {
                        const distance = data.routes[0].summary.distance;
                        if (FetchedDistance) {
                            FetchedDistance(distance);
                        }
                    }
                } else {
                    throw new Error("Route data missing");
                }
            } catch (error) {
                console.error("Error fetching route:", error);
            }
        };
        fetchRoute();
        
    }, [startLocation, endLocation, FetchedDistance]);

    if (!mapCenter) {
		return (
			<div>
				<p className="map-loading-msg">Loading map ...</p>
			</div>
		);
	}  

    return (
        <div className="trip-map">
            <MapContainer
            center={mapCenter}
            zoom={14}
            >
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CircleMarker 
            center={startLocation}
            radius={10}
            color="green"
            weight={2}
            fillColor="green"
            fillOpacity={0.6}>
                <Popup>Start location</Popup>
            </CircleMarker>
            <CircleMarker 
            center={endLocation}
            radius={10}
            color="red"
            weight={2}
            fillColor="red"
            fillOpacity={0.6}>
                <Popup>End location</Popup>
            </CircleMarker>
            {route.length > 0 && (
                <Polyline
                positions={route}
                color="blue"
                weight={4}
                opacity={0.6}
                />
            )}
        </MapContainer>
        </div>
    );
};

export default TripMap;
