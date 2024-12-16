import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const Cities: React.FC = () => {
	useEffect(() => {
		document.title = "Cities - Avec";
	}, []);
	
	const cities = [
		{ name: "Lund", route: "lund" },
		{ name: "Solna", route: "solna" },
		{ name: "Skellefteå", route: "skelleftea" },
	];
	const navigate = useNavigate();

	const displayCity = (city: string) => {
		navigate(`/city/${city}`);
  	};

	return (
	<div>
		<h1>Citites</h1>
      	<ul className="city-list">
			{cities.map((city, index) => (
				<li 
					key={city.route}
					onClick={() => displayCity(city.route)}
					className={index === cities.length - 1 ? "li-last-city" : ""}
				>
            		{city.name}
          		</li>
        	))}
      	</ul>
		<p>Add new city (not implemented yet)</p>
    </div>
  );
};

export default Cities;
