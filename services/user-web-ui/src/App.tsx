import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./views/Home";
import RideHistory from "./views/RideHistory";
import Profile from "./views/Profile";
import Payments from "./views/Payments";

function App() {
	return (
		<Router>
			<Header />
			<main className="main">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/ride-history" element={<RideHistory />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/payments" element={<Payments />} />
				</Routes>
			</main>
			<Footer />
		</Router>
	);
}

export default App;
