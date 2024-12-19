import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { City } from "./interfaces";
import { fetchCities } from "../../fetchModels/fetchCities";


const Cities: React.FC = () => {
	const [cities, setCities] = useState<City[]>([]);

	useEffect(() => {
		document.title = "Cities - Avec";

		const fetchAndSetCities = async () => {
			const result = await fetchCities();
			setCities(result);
			};
		
			fetchAndSetCities();
	}, []);

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
					key={city._id}
					onClick={() => displayCity(city.name)}
					className={index === cities.length - 1 ? "li-last-city" : ""}
				>
            		{city.display_name}
          		</li>
        	))}
      	</ul>
		  <a href="/cities/add" className="add-btn">
		  Add new city
		</a>
    </div>
  );
};

export default Cities;
