import React, { useEffect } from "react";
import "./index.css";
import scooterIcon from "/src/assets/scooter-icon-blue.png";

const Home: React.FC = () => {
	useEffect(() => {
		document.title = "Home - Solo Scoot";
}, []);
    return (
        <div className="wrapper">
            <div className="text-section">
                <h1>Ridin' solo ain't that bad</h1>
                <h2>
                    When you want to get from A to B without hassle, Solo Scoot has your back!
                </h2>
                <p>Enjoy some alone time while getting to your next destination safely.</p>
            </div>
            <div className="scooter-graphic">
                <img src={scooterIcon} className="logo" alt="scooter" />
            </div>
        </div>
    );
};

export default Home;