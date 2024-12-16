import React, { useEffect } from "react";
import "./index.css";
import scooterIcon from "/src/assets/scooter-icon.png";

const Home: React.FC = () => {
	useEffect(() => {
		document.title = "Home - Avec";
}, []);
    return (
        <div className="wrapper">
            <div className="text-section">
                <h1>When you can't wait to go there.</h1>
                <h2>
                    If riding where you're going instead of waiting for the bus sounds like your kind of
                    thing, Avec is for you.
                </h2>
                <p>This is a little scooter service, you know.</p>
            </div>
            <div className="scooter-graphic">
                <img src={scooterIcon} className="logo" alt="scooter" />
            </div>
        </div>
    );
};

export default Home;