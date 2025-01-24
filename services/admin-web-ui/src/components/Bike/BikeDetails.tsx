import React, { useState } from "react";
import { Bike, BikeDetailsProps } from "./interfaces";
import { fetchServiceBike } from "../../fetchModels/fetchServiceBike";
import { fetchDeleteBike } from "../../fetchModels/fetchDeleteBike";
import ConfirmDelete from "../ConfirmDelete";
import AlertMessage from "../AlertMessage";
import { useNavigate } from "react-router-dom";

const BikeDetails: React.FC<BikeDetailsProps> = ({ data }) => {
  const [formData, setFormData] = useState(data);
  const [confirmBox, setConfirmBox] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertBox, setAlertBox] = useState(false);
  const navigate = useNavigate();

  const handleRequestService = async () => {
    try {
      const updatedData = {
        ...formData,
        status: {
          ...formData.status,
          in_service: true,
          available: false,
        },
      };

      setFormData(updatedData);
      await fetchServiceBike(data.bike_id);
      setAlertMessage("Service requested. The bike will be picked up and transported to a service station.");
      setAlertBox(true);
    } catch (error) {
      console.error("Error requesting service:", error);
      setAlertMessage("Error requesting service.");
      setAlertBox(true);
    }
  };

  const openConfirmation = () => setConfirmBox(true);

  const handleDeletion = async () => {
    try {
      await fetchDeleteBike(data.bike_id);
      setAlertMessage("The bike has been deleted. You will be redirected to 'Bikes' in five seconds...");
      setConfirmBox(false);
      setAlertBox(true);

      setTimeout(() => {
        navigate("/bikes");
      }, 5000);
    } catch (error) {
      console.error("Error deleting bike:", error);
      setAlertMessage("Error deleting bike.");
      setConfirmBox(false);
      setAlertBox(true);
    }
  };

  const getBikeStatus = (bike: Bike) => {
    if (formData.status.charging || bike.status.charging) return "Charging";
    else if (formData.status.in_service || bike.status.in_service) return "In Service";
    else if (formData.status.available || bike.status.available) return "Available";
    else return "In use";
  };

  return (
    <div className="bike-details">
        {formData.status.available && <span>Location: [{data.location.join(", ")}]</span>}
        <span>City: {data.city_name}</span>
        <span>Status: {getBikeStatus(data)}</span>
        {formData.status.available && <span>Battery: {data.status.battery_level} %</span>}
        <span>Trips: {data.completed_trips.length}</span>
        <span className="sub-list">
          {data.completed_trips.map((trip, index) => (
            <div key={index}>
              <span className="sub-level-arrow">&#8618; </span>
              Trip&nbsp;
              <span className="more-details">
                <a href={`/trip/${trip}`}>#{trip}</a>
              </span>
            </div>
          ))}
        </span>
        {!formData.status.available && !formData.status.in_service &&
          <span className="bike-ongoing-trip">
            Head over to the <a href={`/map/${data.city_name.toLowerCase()}`}>map for {data.city_name}</a> to see this bike in action!
          </span>}
        {!formData.status.in_service && formData.status.available && 
        <>
        <button className="edit-btn bike service" onClick={handleRequestService}>
          Request Service
        </button>
        <button className="edit-btn bike red" onClick={openConfirmation}>
            Delete bike
        </button>
        </>
        }


      <ConfirmDelete
        boxOpen={confirmBox}
        onClose={() => setConfirmBox(false)}
        onConfirm={handleDeletion} 
        message="Would you like to delete this bike?"
      />
      <AlertMessage
        boxOpen={alertBox}
        onClose={() => setAlertBox(false)}
        message={alertMessage} 
      />
    </div>
  );
};

export default BikeDetails;
