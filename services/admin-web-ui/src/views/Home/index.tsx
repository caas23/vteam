import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AlertMessage from "../../components/AlertMessage";
import "./index.css";
import scooterIcon from "/src/assets/scooter-icon-blue.png";

const Home: React.FC = () => {
    const location = useLocation();
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertBoxOpen, setAlertBoxOpen] = useState(false);
    const user = sessionStorage.getItem("user");

	useEffect(() => {
		document.title = "Home - Solo Scoot";

        if (location.state && location.state.message) {
            setAlertMessage(location.state.message);
            setAlertBoxOpen(true);
      
            setTimeout(() => {
              setAlertBoxOpen(false);
              setAlertMessage(null);
            }, 5000);
      
            return;
        }
    }, [location.state]);

    const GITHUB_ID = import.meta.env.VITE_GITHUB_ID_ADMIN;
    const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_ID}&scope=read:user,user:email`;

    const handleAuth = () => {
        window.location.href = githubOAuthUrl;
    };

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

                {!user && <button className="auth-btn" onClick={handleAuth}>Log in with GitHub</button>}
            </div>
            <div className="scooter-graphic">
                <img src={scooterIcon} className="logo" alt="scooter" />
            </div>
            {alertBoxOpen && alertMessage && (
                <AlertMessage
                    boxOpen={alertBoxOpen}
                    onClose={() => setAlertBoxOpen(false)}
                    message={alertMessage}
                />
            )}
        </div>
    );
};

export default Home;