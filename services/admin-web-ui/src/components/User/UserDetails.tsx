import React from "react";
import { UserDetailsProps } from "./interfaces";

const UserDetails: React.FC<UserDetailsProps> = ({ data }) => {
  return (
    <div>
      <div className="user-details">
        <span>Name: {data.name}</span>
        <span>Email: {data.email}</span>
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
      </div>
      <span className="banned-user">{data.banned ? "This user is currently banned" : ""}</span>
    </div>
  );
};

export default UserDetails;
