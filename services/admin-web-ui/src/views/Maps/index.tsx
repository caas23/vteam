import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { City } from "./interfaces";
import { fetchCities } from "../../fetchModels/fetchCities";


const Maps: React.FC = () => {
	const [cities, setCities] = useState<City[]>([]);

	useEffect(() => {
		document.title = "Maps - Solo Scoot";

		const fetchAndSetCities = async () => {
			const result = await fetchCities();
			setCities(result);
			};
		
			fetchAndSetCities();
	}, []);
	
	const navigate = useNavigate();

	const displayCityMap = (city: string) => {
		navigate(`/map/${city}`);
  	};
	
	return (
    <div>
		<h1>Maps</h1>
      	<ul className="city-list">
			{cities.map((city) => (
				<li key={city._id} onClick={() => displayCityMap(city.name)}>
            		{city.display_name}
          		</li>
        	))}
      	</ul>
    </div>
  );
};

export default Maps;
