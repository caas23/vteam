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
                <h1>This week's highlights</h1>
                <h2>
                    - The new system is being launched as we speak.<br></br>
                    - A new coffee machine will be delivered just in time for <i>fredagsfika</i>.<br></br>
                    - Spring is just around the corner. Well, almost ...
                </h2>
                <p><i>And remember ...</i></p>
                <p>Working at Solo Scoot, you will never get tired of putting the time in.</p>
            </div>
            <div className="scooter-graphic">
                <img src={scooterIcon} className="logo" alt="scooter" />
            </div>
        </div>
    );
};

export default Home;