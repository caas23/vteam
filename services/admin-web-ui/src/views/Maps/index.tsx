import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const Maps: React.FC = () => {
	useEffect(() => {
		document.title = "Maps - Avec";
	}, []);
	
	// ett sätt att bibehålla å, ä och ö när vi skriver ut stadens namn,
	// nackdel: behöva lägga in städer manuellt, fördel: smidig lösning
	// får fundera på bra lösning senare när db kommer in i bilden
	const cities = [
		{ name: "Lund", route: "lund" },
		{ name: "Solna", route: "solna" },
		{ name: "Skellefteå", route: "skelleftea" },
	];
	const navigate = useNavigate();


	const displayCityMap = (city: string) => {
		navigate(`/map/${city}`);
  	};
	
	return (
    <div>
		<h1>Maps</h1>
      	<ul className="city-list">
			{cities.map((city) => (
				<li key={city.route} onClick={() => displayCityMap(city.route)}>
            		{city.name}
          		</li>
        	))}
      	</ul>
    </div>
  );
};

export default Maps;
