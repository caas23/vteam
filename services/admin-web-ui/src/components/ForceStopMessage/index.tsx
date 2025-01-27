import React, { useState } from "react";
import "./index.css";
import { AlertProps } from "./interfaces";

const ForceStopMessage: React.FC<AlertProps> = ({
	boxOpen,
	onClose,
	header = "Stop trip",
	message = "",
	onSubmitReason,
}) => {
	const [selectedReason, setSelectedReason] = useState("");

	if (!boxOpen) return null;

	const handleSubmit = () => {
		if (selectedReason) {
			onSubmitReason(selectedReason);
			onClose();
		} else {
			alert("You must select a reason.");
		}
	};

	return (
		<div className="confirmation-overlay">
			<div className="confirmation-content">
				<p>{header}</p>
				{message}
				<div className="reason-select">
				<label>
					<select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
						<option value="" disabled>Choose a reason ...</option>
						<option value="Battery too low">Battery too low</option>
						<option value="Dangerous driving">Dangerous driving</option>
						<option value="Suspicious behavior">Suspicious behavior</option>
						<option value="Other">Other</option>
					</select>
				</label>
				</div>
				<div className="confirmation-buttons">
				<button className="edit-btn blue" onClick={handleSubmit}>
					Submit
				</button>
				<button className="edit-btn gray" onClick={onClose}>
					Close
				</button>
				</div>
			</div>
		</div>
  	);
};

export default ForceStopMessage;
