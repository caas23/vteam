import React from "react";
import "./index.css";
import { HeaderProps } from "./interfaces";

const Header: React.FC<HeaderProps> = ({ user, updateUserStatus }) => {
	const handleLogout = () => {
		sessionStorage.removeItem('access_token');
		sessionStorage.removeItem('user');
		updateUserStatus(); 
		window.location.href = '/';
	};

	return (
		<header className="header">
			<div className="header-wrapper">
				<div className="logo">
					<a href="/">
						<img src="src/assets/solo-scoot-logo.png" alt="Logo" />
					</a>
				</div>
				{user ? <nav className="navigation">
					<ul>
						<li>
							<a href="ride-history">Ride History</a>
						</li>
						<li>
							<a href="profile">Profile</a>
						</li>
						<li>
							<a href="payments">Payments</a>
						</li>
						<li>
							<button className="logout-btn" onClick={handleLogout}>Log out</button>
						</li>
					</ul>
				</nav> :
				""}
			</div>
		</header>
	);
};

export default Header;
