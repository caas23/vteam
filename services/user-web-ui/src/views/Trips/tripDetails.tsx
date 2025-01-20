import React from "react";
import { TripDetailsProps } from "./interfaces";

const TripDetails: React.FC<TripDetailsProps> = ({ trips }) => {
	return (
		<div>
		<div className="trip-details">
			<span>Trips: {trips.length}
				<span className="sub-list">
				{trips.map((trip: string, index: number) => (
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
		</div>
	);
};

export default TripDetails;
