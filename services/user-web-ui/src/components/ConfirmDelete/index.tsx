import React from "react";
import "./index.css";
import { ConfirmDeleteProps } from "./interfaces";

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  boxOpen,
  onClose,
  onConfirm,
  title = "Confirm deletion",
  message = "Would you like to delete this item from the city?",
}) => {
  if (!boxOpen) return null;

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-content">
        <p>{title}</p>
        {message}
        <div className="confirmation-buttons">
          <button className="edit-btn red" onClick={onConfirm}>
            Delete
          </button>
          <button className="edit-btn gray" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelete;
