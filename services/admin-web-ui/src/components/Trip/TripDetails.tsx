import React, { useState } from "react";
import { TripDetailsProps } from "./interfaces";
import TripMap from "./TripMap";
import BigAlertMessage from "../BigAlertMessage";


const TripDetails: React.FC<TripDetailsProps> = ({ data }) => {
  const [distance, setDistance] = useState<number | null>(null);
  const [alertBox, setAlertBox] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const totalSeconds = (new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / 1000;
  const totalMinutes =  totalSeconds / 60;
  const averageSpeed = distance !== null && totalSeconds > 0 
    ? (distance / 1000) / (totalSeconds / 3600) : null;

  const handlePriceInfoClick = () => {
    setAlertMessage(`
      Every trip has a set start fee, and a set price per minute.
      If a bike is left outside a parking or charging zone,
      a fee is added to the total price.
      If a bike is picked up outside a parking or charging zone,
      and then parked at one of those zones, you get a discount.
      
      - Start fee: 10 kr
      - Price per minute: 2,50 kr
      - Basic fee: +5 kr
      - Basic discount: -5 kr

      Please note that these are general prices,
      your specific trip may have additional fees or discounts.

      If you have questions about your specific trip,
      please submit an email to trips@soloscoot.com
      `);

      
    setAlertBox(true);
  };
  
  return (
    <div className="trip-details-map">
      <div className="trip-details">
        <span>Date: {new Date(data.start_time).toLocaleString().split(" ")[0]}</span>
        <span>Start location: [{data.start_location.join(", ")}]</span>
        <span>End location: [{data.end_location.join(", ")}]</span>
        <span>Start time: {new Date(data.start_time).toLocaleString().split(" ")[1]}</span>
        <span>End time: {new Date(data.end_time).toLocaleString().split(" ")[1]}</span>
        <span>Total time: {totalMinutes.toFixed()} min {(totalSeconds % 60).toFixed()} sec</span>
        {distance !== null && (
          <span>Total distance: {(distance / 1000).toFixed(2)} km</span>
        )}
        {averageSpeed !== null && (
          <span>Average speed: {averageSpeed.toFixed(1)} km/h</span>
        )}
        <span className="trip-price">Price: {data.price} kr</span>
        <div onClick={handlePriceInfoClick} className="price-info"></div>
        
      </div>
        <TripMap
        startLocation={data.start_location}
        endLocation={data.end_location}
        FetchedDistance={setDistance}
        />
        <BigAlertMessage
				boxOpen={alertBox}
				onClose={() => setAlertBox(false)}
				message={alertMessage}
        header={"Pricing"}
			/>
    </div>
  );
};

export default TripDetails;
