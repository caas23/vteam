import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Callback from "./components/Callback";
import Home from "./views/Home";
import Trips from "./views/Trips";
import Trip from './components/Trip';
import Profile from "./views/Profile";
import Payments from "./views/Payments";
import ProtectedRoute from "./components/AuthCheck";

function App() {
	const [user, setUser] = useState(() => {
		const storedUser = sessionStorage.getItem("user");
		return storedUser ? JSON.parse(storedUser) : null;
	});

	const updateUserStatus = () => {
		const storedUser = sessionStorage.getItem("user");
		setUser(storedUser ? JSON.parse(storedUser) : null);
	};
	
	useEffect(() => {
		const handleStorageChange = () => {
		  updateUserStatus();
		};
	
		window.addEventListener("storage", handleStorageChange);
	
		return () => {
		  window.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	return (
		<Router>
			<Header user={user} updateUserStatus={updateUserStatus}/>
			<main className="main">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/callback" element={<Callback updateUserStatus={updateUserStatus} />} />
					<Route path="/trip/:trip" element={<ProtectedRoute component={Trip} />} />
					<Route path="/trips" element={<ProtectedRoute component={Trips} />} />
					<Route path="/profile" element={<ProtectedRoute component={Profile} />} />
					<Route path="/payments" element={<ProtectedRoute component={Payments} />} />
				</Routes>
			</main>
			<Footer />
		</Router>
	);
}

export default App;
