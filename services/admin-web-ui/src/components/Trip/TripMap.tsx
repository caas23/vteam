import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, Polyline } from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import { TripMapProps } from "./interfaces";
import startMarker from "/src/assets/start-location.png";
import endMarker from "/src/assets/end-location.png";

const TripMap: React.FC<TripMapProps> = ({ data, startLocation, endLocation, FetchedDistance }) => {
    const mapCenter: [number, number] = [
        (startLocation[0] + endLocation[0]) / 2,
        (startLocation[1] + endLocation[1]) / 2,
    ];

    const startLocationMarker = L.icon({
        iconUrl: startMarker,
        iconSize: [40, 40],
        popupAnchor: [0, -5],
    });

    const endLocationMarker = L.icon({
        iconUrl: endMarker,
        iconSize: [40, 40],
        popupAnchor: [0, -5],
    });

    const [route, setRoute] = useState<[number, number][]>([]);

    useEffect(() => {
        // om rutten inte finns i databasen, hämta via openrouteservice
        if (!data.route) {
            const API_KEY = import.meta.env.VITE_API_KEY;

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

                    FetchedDistance && FetchedDistance(data.routes[0]?.summary?.distance);
                    } else {
                        throw new Error("Route data missing");
                    }
            } catch (error) {
                console.error("Error fetching route:", error);
            }
        };
        fetchRoute();
        // om rutten finns i databasen, använd den datan
        } else {
            setRoute(data.route);
            FetchedDistance && FetchedDistance(data.distance || 0);
        }
    }, [startLocation, endLocation, data, FetchedDistance]);
    
    if (!route) {
        return (
        <div>
            <p className="map-loading-msg">Loading map ...</p>
        </div>
        );
    }

    return (
    <div className="trip-map">
        <MapContainer center={mapCenter} zoom={14}>
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={startLocation} icon={startLocationMarker}>
            <Popup>Start location</Popup>
            </Marker>
            <Marker position={endLocation} icon={endLocationMarker}>
            <Popup>End location</Popup>
            </Marker>
            {route.length > 0 && <Polyline positions={route} color="#2E6DAE" weight={4} />}
        </MapContainer>
    </div>
  );
};

export default TripMap;
