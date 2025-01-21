import React from "react";
import { Payment } from "./interfaces";

const RowDetails: React.FC<{ data: Payment[] }> = ({ data }) => {
	return (
		<tr className="selected-row">
		<td colSpan={3}>
			{data.map((item) => (
			<div key={item.trip_id} className="payment-row">
			<span>
				<strong>Trip <a href={`/trip/${item.trip_id}`}>#{item.trip_id}</a></strong>
			</span>
			<span>Payment: {item.method}</span>
			<span>Total: {item.cost} kr</span>
			</div>
			))}
		</td>
		</tr>
	);
};

export default RowDetails;
