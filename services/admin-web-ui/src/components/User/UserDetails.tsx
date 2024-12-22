import React, { useState } from "react";
import { UserDetailsProps } from "./interfaces";
import { fetchBanUser } from "../../fetchModels/fetchBanUser";
import { fetchDeleteUser } from "../../fetchModels/fetchDeleteUser";

import ConfirmDelete from "../ConfirmDelete";
import AlertMessage from "../AlertMessage";
import { useNavigate } from "react-router-dom";

const UserDetails: React.FC<UserDetailsProps> = ({ data }) => {
  const [formData, setFormData] = useState(data);
  const [confirmBox, setConfirmBox] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertBox, setAlertBox] = useState(false);
  const navigate = useNavigate();

  const handleBanUser = async () => {
      try {
        const updatedData = {
          ...formData,
          banned: true
        };
  
        setFormData(updatedData);
        await fetchBanUser(data.user_id);
        setAlertMessage("User banned. The user will no longer be able to rent bikes.");
        setAlertBox(true);
      } catch (error) {
        console.error("Error banning user:", error);
        setAlertMessage("Error banning user.");
        setAlertBox(true);
      }
  };
  
  const openConfirmation = () => setConfirmBox(true);

  const handleDeletion = async () => {
      try {
        await fetchDeleteUser(data.user_id);
        setAlertMessage("The user has been deleted. You will be redirected to 'Users' in five seconds...");
        setConfirmBox(false);
        setAlertBox(true);
  
        setTimeout(() => {
          navigate("/users");
        }, 5000);
      } catch (error) {
        console.error("Error deleting user:", error);
        setAlertMessage("Error deleting user.");
        setConfirmBox(false);
        setAlertBox(true);
      }
    };


  return (
    <div>
      <div className="user-details">
        <span>Name: {data.name}</span>
        <span>Payment method: {data.payment_method}</span>
        <span>Trips: {data.completed_trips.length}
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
        </span>

        {!formData.banned ? 
        <button className="edit-btn bike service" onClick={handleBanUser}>
          Ban user
        </button>
        : ""}
        <button className="edit-btn bike red" onClick={openConfirmation}>
            Delete user
        </button>
      </div>
      <span className="banned-user">{formData.banned ? "This user is currently banned" : ""}</span>
      <ConfirmDelete
        boxOpen={confirmBox}
        onClose={() => setConfirmBox(false)}
        onConfirm={handleDeletion} 
        message="Would you like to delete this user?"
      />
      <AlertMessage
        boxOpen={alertBox}
        onClose={() => setAlertBox(false)}
        message={alertMessage} 
      />
    </div>
  );
};

export default UserDetails;
