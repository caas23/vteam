import React, { useEffect } from "react";
import { TripMapProps } from "./interfaces";

const TripDistance: React.FC<TripMapProps> = ({ data, startLocation, endLocation, FetchedDistance }) => {
    useEffect(() => {
        // if the route is not in the database, get via openrouteservice
        if (!data.route && !(startLocation[0] == endLocation[0]) && !(startLocation[1] == endLocation[1])) {
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
                        FetchedDistance && FetchedDistance(data.routes[0]?.summary?.distance);
                    } else {
                        throw new Error("Route data missing");
                    }
                } catch (error) {
                    console.error("Error fetching route:", error);
                }
            };
            fetchRoute();
        // if route is in database, use that data
        } else {
            FetchedDistance && FetchedDistance(data.distance || 0);
        }
    }, [startLocation, endLocation, data, FetchedDistance]);
    
    return null;
};

export default TripDistance;
