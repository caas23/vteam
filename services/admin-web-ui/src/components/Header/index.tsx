import React from "react";
import "./index.css";

const Header: React.FC = () => {
	return (
		<header className="header">
			<div className="header-wrapper">
				<div className="logo">
					<a href="/">
						<img src="/src/assets/solo-scoot-logo.png" alt="Logo"/>
					</a>
				</div>
				<nav className="navigation">
					<ul>
						<li>
							<a href="/bikes">Bikes</a>
						</li>
						<li>
							<a href="/cities">Cities</a>
						</li>
						<li>
							<a href="/maps">Maps</a>
						</li>
						<li>
							<a href="/users">Users</a>
						</li>
					</ul>
				</nav>
			</div>
		</header>
	);
};

export default Header;
