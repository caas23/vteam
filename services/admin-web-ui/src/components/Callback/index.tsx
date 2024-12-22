import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { fetchGitHubAccessToken } from "../../fetchModels/fetchGitHubToken";
import { CallbackProps } from "./interfaces";

const Callback: React.FC<CallbackProps> = ({ updateUserStatus }) => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAccessToken = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");

            if (!code) {
                setError("No code found in the URL.");
                setLoading(false);
                return;
            }

            try {
                const data = await fetchGitHubAccessToken(code);

                if (!data) {
                    setError("Failed to fetch access token");
                    setLoading(false);
                    return;
                }
                
                sessionStorage.setItem("access_token", data.access_token);
                sessionStorage.setItem("user", JSON.stringify(data.user));

                updateUserStatus();
                navigate('/');
            } catch (error) {
                console.error("Error fetching access token:", error);
                setError("Authentication failed.");
            } finally {
                setLoading(false);
            }
        };

        fetchAccessToken();
    }, []);

    return (
        <div>
            {loading ? (
                <div className="auth-message">
                    <p className="auth-text">Authenticating<span className="dots"></span></p>
                </div>
            ) : error ? (
                <div className="auth-message">
                    <p className="auth-text">{error}</p>
                </div>
            ) : (
                <div className="auth-message">
                    <p className="auth-text">Authentication successful! Redirecting<span className="dots"></span></p>
                </div>
            )}
        </div>
    );
};

export default Callback;
