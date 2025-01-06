import React from "react";
import "./index.css";
import { AlertProps } from "./interfaces";

const AlertMessage: React.FC<AlertProps> = ({
  boxOpen,
  onClose,
  header = "Alert",
  message = "",
}) => {
  if (!boxOpen) return null;

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-content">
        <p>{header}</p>
        {message}
        <div className="confirmation-buttons">
          <button className="edit-btn blue" onClick={onClose}>
          Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertMessage;
