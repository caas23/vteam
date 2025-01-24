import React, { useEffect, useState } from "react";
import "./index.css";
import { Payment, Payments } from "./interfaces";
import { fetchPayments } from "../../fetchModels/fetchPayments";
import TableRow from "./TableRow";
import { fetchUpdatePaymentStatus } from "../../fetchModels/fetchUpdatePaymentStatus";

const updatePaymentStatus = async (tripId: string) => {
	const paid = true;
	return await fetchUpdatePaymentStatus(tripId, paid, "monthly")
};

const PaymentDetails: React.FC<{ userId: string }> = ({ userId }) => {
	const [payments, setPayments] = useState<Payments | null>(null);
	const [selectedRow, setSelectedRow] = useState<number | null>(null);

	useEffect(() => {
		const fetchPaymentDetails = async () => {
			try {
				const result = await fetchPayments(userId);
				const paymentData = result[0] || { trips: [] };
				const currentDate = (new Date()).getDate();
	
				const updatedTrips = await Promise.all(
					paymentData.trips.map(async (trip: Payment) => {
						if (!trip.paid && currentDate >= 27) {
							await updatePaymentStatus(trip.trip_id);
							return { ...trip, paid: true };
						}
						return trip;
						})
					);
				setPayments({ ...paymentData, trips: updatedTrips });
			} catch (e) {
				console.error("Error fetching payment details", e);
			}
		};
		fetchPaymentDetails();
	}, [userId]);

	
	if (!payments) {
		return (
			<div className="loading-message">
				<p>Loading payments <span className="dots"></span></p>
			</div>
		)
	}
	
	const unpaidTrips = payments?.trips?.filter(trip => !trip.paid) || [];
	const paidTrips = payments?.trips?.filter(trip => trip.paid) || [];
	
	const toggleDetails = (index: number) => {
		setSelectedRow(selectedRow === index ? null : index);
	};

	const tableRows = [
		{ category: "Unpaid", count: unpaidTrips.length, data: unpaidTrips },
		{ category: "Paid", count: paidTrips.length, data: paidTrips },
	];

	return (
		<>
		<table className="payment-table">
			<thead>
				<tr>
				<th>Category</th>
				<th>Count</th>
				<th>Details</th>
				</tr>
			</thead>
			<tbody>
				{tableRows.map((row, index) => (
				<TableRow
					key={index}
					row={row}
					rowIndex={index}
					selectedRow={selectedRow}
					toggleDetails={toggleDetails}
				/>
				))}
			</tbody>
		</table>
		<span className="payment-info">
			* Unpaid trips are handled on the 27th of each month, please note that it may take a day or two for payments to go through.
		</span>
		</>
	);
};

export default PaymentDetails;
