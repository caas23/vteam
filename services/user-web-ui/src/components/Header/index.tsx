import React from "react";
import "./index.css";

const Header: React.FC = () => {
	return (
		<header className="header">
			<div className="header-wrapper">
				<div className="logo">
					<a href="/">
						<img src="src/assets/avec-logo.svg" alt="Logo" />
					</a>
				</div>
				<nav className="navigation">
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
					</ul>
				</nav>
			</div>
		</header>
	);
};

export default Header;
