import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { RowItemProps, ChargingStation, ParkingZone, Rule } from "./interfaces";
import { fetchUpdateCharging } from "../../fetchModels/fetchUpdateCharging";
import { fetchUpdateParking } from "../../fetchModels/fetchUpdateParking";
import { fetchUpdateRule } from "../../fetchModels/fetchUpdateRule";
import { fetchDeleteItem } from "../../fetchModels/fetchDeleteItem";
import ConfirmDelete from "../ConfirmDelete";
import AlertMessage from "../AlertMessage";

const RowDetails: React.FC<RowItemProps> = ({ item, onDelete }) => {
	const { city } = useParams<{ city: string }>();
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState(item);
	const [submittedData, setSubmittedData] = useState(item);
	const [confirmBox, setConfirmBox] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [alertBox, setAlertBox] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);


	useEffect(() => {
		setFormData(item);
		setSubmittedData(item);
	  }, [item]);

	const handleEditClick = () => setEditing(true);
	
	const handleCancelClick = () => {
		setEditing(false);
		setFormData(submittedData);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		const coordinatesString = value.split("|").map((pair) => pair.trim());
		
		const validCoordinates = coordinatesString
		  .map((pair) => pair.split(",").map((coord) => parseFloat(coord.trim())))
		  .filter((pair) => pair.length === 2 && pair.every((coord) => !isNaN(coord)));
	
		setFormData((prev) => ({
		  ...prev,
		  [name]: name === "area" ? validCoordinates : value,
		}));
	  };

	const handleSubmit = async () => {
		try {
		  	if ("charging_id" in formData) {
				await fetchUpdateCharging(formData as ChargingStation);
				setConfirmBox(false);
				setAlertMessage("The charging station has been updated.");
			} else if ("parking_id" in formData) {
				await fetchUpdateParking(formData as ParkingZone);
				setConfirmBox(false);
				setAlertMessage("The parking zone has been updated.");
			} else if ("rule_id" in formData) {
				await fetchUpdateRule(formData as Rule);
				setConfirmBox(false);
				setAlertMessage("The rule has been updated.");
		  	}
		  	setEditing(false);
			setSubmittedData(formData);
		} catch (error) {
		  console.error("Error updating city:", error);
		  setAlertMessage("Error updating city. No changes were saved.");
		} finally {
			setAlertBox(true);
		}
	};

	const openConfirmation = () => setConfirmBox(true);
	const handleDeletion = async () => {
		try {
		if ("charging_id" in item && city) {
			await fetchDeleteItem(city, item.charging_id, "charging");
			setAlertMessage("The charging station has been deleted.");
			onDelete("charging", item.charging_id);
		} else if ("parking_id" in item && city) {
			await fetchDeleteItem(city, item.parking_id, "parking");
			setAlertMessage("The parking zone has been deleted.");
			onDelete("parking", item.parking_id);
		} else if ("rule_id" in item && city) {
			await fetchDeleteItem(city, item.rule_id, "rule");
			setAlertMessage("The rule has been deleted.");
			onDelete("rule", item.rule_id);
		}
		setConfirmBox(false);
		setEditing(false);
		} catch (error) {
			console.error("Error deleting item:", error);
			setAlertMessage("Error deleting item.");
		} finally {
			setAlertBox(true);
		}
	};


	// bike
	if ("bike_id" in item) {
		return (
		<div className="city-row">
			<span>
				<strong>Bike #{item.bike_id}</strong>
			</span>
			<span>Status: {item.status.in_service ? "In Service" : item.status.available ? "Available" : "Occupied"}</span>
			<span>Location: [{item.location.join(", ")}]</span>
			<span className="more-details"><a href={`/bike/${item.bike_id}`}>View more details</a></span>
		</div>
		);
	}

	const editableArea = (area: [number, number][]) =>
		area.map((pair) => pair.join(", ")).join(" | ");
	
	  const readOnlyArea = (area: [number, number][]) =>
		area.map((coordinatePair, index) => (
		  <pre key={index}>
			<span className="spacing">{index === 0 ? "[" : ""}</span>
			[{coordinatePair.join(", ")}]
			{index < area.length - 1 ? ", " : "]"}
		  </pre>
		));

	// station
	if ("charging_id" in item && "charging_id" in submittedData) {
		const station = formData as ChargingStation;
		return (
		<div className="city-row">
			<span>
			<strong>Station #{item.charging_id}</strong>
			{!editing && <span className="edit" onClick={handleEditClick}>&#9998;</span>}
			</span>
			{editing ? (
			<div>
				<textarea
				name="area"
				className="edit-area"
				value={editableArea(station.area)}
				onChange={handleInputChange}
				ref={textareaRef}
				/>
				<button className="edit-btn blue" onClick={handleSubmit}>Update</button>
				<button className="edit-btn red" onClick={openConfirmation}>Delete station</button>
				<button className="edit-btn gray" onClick={handleCancelClick}>Cancel</button>
			</div>
			) : (
				<div>
					<span>Area: {readOnlyArea(submittedData.area)}</span>
					<span>Plugs: {item.plugs.length}
						<span className="sub-list">
						{item.plugs.map((plug, index) => (
							<div key={index}>
							<span className="sub-level-arrow">&#8618; </span> 
								Plug #{plug.id}: {plug.available ? "Available" : "Occupied"}
							</div>
						))}
						</span>
					</span>
				</div>

			)}
			<ConfirmDelete
				boxOpen={confirmBox}
				onClose={() => setConfirmBox(false)}
				onConfirm={handleDeletion}
			/>

			<AlertMessage
				boxOpen={alertBox}
				onClose={() => setAlertBox(false)}
				message={alertMessage}
			/>
		</div>
		);
	}

	// parking
	if ("parking_id" in item && "parking_id" in submittedData) {
		const zone = formData as ParkingZone;
		return (
		<div className="city-row">
			<span>
			<strong>Zone #{item.parking_id}</strong>
			{!editing && <span className="edit" onClick={handleEditClick}>&#9998;</span>}
			</span>
			{editing ? (
			<div>
				<textarea
				name="area"
				className="edit-area"
				value={editableArea(zone.area)}
				onChange={handleInputChange}
				ref={textareaRef}
				/>
				<button className="edit-btn blue" onClick={handleSubmit}>Update</button>
				<button className="edit-btn red" onClick={openConfirmation}>Delete parking</button>
				<button className="edit-btn gray" onClick={handleCancelClick}>Cancel</button>
			</div>
			) : (
			<span>Area: {readOnlyArea(submittedData.area)}</span>
			)}

			<ConfirmDelete
				boxOpen={confirmBox}
				onClose={() => setConfirmBox(false)}
				onConfirm={handleDeletion}
			/>

			<AlertMessage
				boxOpen={alertBox}
				onClose={() => setAlertBox(false)}
				message={alertMessage}
			/>
		</div>
		);
	}

	// rules
	if ("rule_id" in item && "rule_id" in submittedData) {
		const rule = formData as Rule;
		return (
		<div className="city-row">
			<span>
			<strong>Rule #{item.rule_id}</strong>
			{!editing && <span className="edit" onClick={handleEditClick}>&#9998;</span>}
			</span>
			{editing ? (
			<div>
				<textarea
				name="description"
				className="edit-area one-line"
				value={rule.description}
				onChange={handleInputChange}
				/>
				<button className="edit-btn blue" onClick={handleSubmit}>Update</button>
				<button className="edit-btn red" onClick={openConfirmation}>Delete rule</button>
				<button className="edit-btn gray" onClick={handleCancelClick}>Cancel</button>
			</div>
			) : (
			<span>Description: {submittedData.description}</span>
			)}

			<ConfirmDelete
				boxOpen={confirmBox}
				onClose={() => setConfirmBox(false)}
				onConfirm={handleDeletion}
			/>

			<AlertMessage
				boxOpen={alertBox}
				onClose={() => setAlertBox(false)}
				message={alertMessage}
			/>
		</div>
		);
  	}

  	return null;
};

export default RowDetails;

