import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./index.css";
import ShowParkingZones from "../ParkingZones";
import { MapProps } from "./interfaces";
import parkingIcon from "/src/assets/parking-spot-blue.png";
import { calculateCentroid } from "../Calculations";

const ParkingZonesMap: React.FC<MapProps> = ({ availableZones, handleMarkerClick, city }) => {
  const [cityCenter, setCityCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
      setCityCenter(null);

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
  
  const parkingZoneMarker = L.icon({
		iconUrl: parkingIcon,
		iconSize: [30, 30],
		iconAnchor: [15, 30],
		popupAnchor: [1, -20],
	});

  if (!cityCenter) {
		return (
			<div className="loading-parking-zones-map">
				<p className="map-loading-msg">Loading map ...</p>
			</div>
		);
	}

  return (
    <div className="parking-zones-map">
      <MapContainer
        center={cityCenter}
        zoom={12}
        style={{ height: "100%"}}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        <ShowParkingZones zones={availableZones} />
        {availableZones.map((zone) => {
          const center = calculateCentroid(zone.area);
          return (
            <Marker
              key={zone.parking_id}
              icon={parkingZoneMarker}
              position={center}
              eventHandlers={{ click: () => handleMarkerClick(zone.parking_id) }}
            >
              <Popup>{zone.parking_id}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
    );
};

export default ParkingZonesMap;