import React, { useState } from "react";
import { BikeDetailsProps } from "./interfaces";
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

  
  return (
    <div className="bike-details">
        <span>Location: [{data.location.join(", ")}]</span>
        <span>City: {data.city_name}</span>
        <span>Speed: {data.speed} km/h</span>
        <span>Status: {formData.status.in_service ? "In Service" : formData.status.available ? "Available" : "In use"}</span>
        <span>Battery: {data.status.battery_level} %</span>
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
