import React from "react";
import "./index.css";

const Footer: React.FC = () => {
	return (
		<footer className="footer">
			<div className="footer-wrapper">
				<ul>
					<li>
						<a href="">Some link</a>
					</li>
					<li>
						<a href="">Another one</a>
					</li>
					<li>
						<a href="">Here goes a third link</a>
					</li>
				</ul>
				<ul>
					<li>
						<a href="">Scooter</a>
					</li>
					<li>
						<a href="">About Avec</a>
					</li>
					<li>
						<a href="">Manage payments</a>
					</li>
				</ul>
			</div>
            <p>&copy; Copyright 2024 – Avec, Inc.</p>
		</footer>
	);
};

export default Footer;
