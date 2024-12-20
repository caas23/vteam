import React from "react";
import "./index.css";

const Footer: React.FC = () => {
	return (
		<footer className="footer">
			<div className="footer-wrapper">
				<ul>
					<li>
						<a href="ride-history">Some link</a>
					</li>
					<li>
						<a href="profile">Another one</a>
					</li>
					<li>
						<a href="payment">Here goes a third link</a>
					</li>
				</ul>
				<ul>
					<li>
						<a href="ride-history">Scooter</a>
					</li>
					<li>
						<a href="profile">About Solo Scoot</a>
					</li>
					<li>
						<a href="payment">Manage payments</a>
					</li>
				</ul>
			</div>
            <p>&copy; Copyright 2024 – Solo Scoot, Inc.</p>
		</footer>
	);
};

export default Footer;
