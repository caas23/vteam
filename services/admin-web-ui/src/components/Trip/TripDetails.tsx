import React, { useState } from "react";
import { TripDetailsProps } from "./interfaces";
import TripMap from "./TripMap";
import BigAlertMessage from "../BigAlertMessage";

const TripDetails: React.FC<TripDetailsProps> = ({ data }) => {
  const [distance, setDistance] = useState<number | null>(null);
  const [alertBox, setAlertBox] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const totalSeconds = (new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / 1000;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const averageSpeed = distance && totalSeconds > 0 
    ? (distance / 1000) / (totalSeconds / 3600) : 0;

  const currentDate = (new Date()).getDate();
  const currentMonth = parseInt(((new Date()).toISOString()).split('-')[1]);
  const currentYear = (new Date()).getFullYear();

  const tripMonth = parseInt(data.end_time.toString().split('-')[1])
  const tripYear = parseInt(data.end_time.toString().split('-')[0])

  const handlePriceInfoClick = () => {
    setAlertMessage(`
      Every trip has a set start fee, and a set price per minute.
      If a bike is left outside a parking or charging zone,
      a fee is added to the total price.
      If a bike is picked up outside a parking zone, and then parked
      at one of those or at a charging station, a discount is applied.
      
      - Start fee: 10 kr
      - Price per minute: 2,50 kr
      - Basic fee: +5 kr
      - Basic discount: -5 kr

      Please note that these are general prices,
      a specific trip may have additional fees or discounts.

      If a customer has any questions about their specific trip,
      please refer them to custom support at trips@soloscoot.com.
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
        {distance ? (
          <span>Total distance: {(distance / 1000).toFixed(2)} km</span>
        ) : <span>Total distance: 0 km</span>}
        <span>Average speed: {averageSpeed.toFixed(1)} km/h</span>
        <span className="trip-price">Price: {data.price} kr</span>
        <div onClick={handlePriceInfoClick} className="price-info"></div>
        {(data.paid || currentYear > tripYear || (currentDate >= 27 && currentMonth != tripMonth)) && (
        <div className="paid">
          <span>Paid &#10003;</span>
        </div>
        )}
        {!data.paid && (!(currentYear > tripYear) || (currentDate < 27 && currentMonth == tripMonth)) && (
        <div className="not-paid">
          <span>Awaiting monthly payment ...</span>
        </div>
        )}
      </div>
      {data.trip_info && (
      <div className="trip-info">
        <span>{data.trip_info}</span>
        {data.fee != 0 && <span>{data.fee}</span> }
      </div>
      )}
      <TripMap
        data={data}
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
