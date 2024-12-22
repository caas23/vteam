import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AddBike from "./components/AddBike";
import Bike from "./components/Bike";
import Callback from "./components/Callback";
import City from "./components/City";
import AddCity from "./components/AddCity";
import Map from "./components/Map";
import Trip from "./components/Trip";
import Home from "./views/Home";
import Bikes from "./views/Bikes";
import Cities from "./views/Cities";
import Maps from "./views/Maps";
import Users from "./views/Users";
import User from "./components/User";
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
          <Route path="/bikes" element={<ProtectedRoute component={Bikes} />} />
          <Route path="/bikes/add" element={<ProtectedRoute component={AddBike} />} />
          <Route path="/bike/:bike" element={<ProtectedRoute component={Bike} />} />
					<Route path="/callback" element={<Callback updateUserStatus={updateUserStatus} />} />
          <Route path="/cities" element={<ProtectedRoute component={Cities} />} />
          <Route path="/cities/add" element={<ProtectedRoute component={AddCity} />} />
          <Route path="/city/:city" element={<ProtectedRoute component={City} />} />
          <Route path="/maps" element={<ProtectedRoute component={Maps} />} />
          <Route path="/map/:city" element={<ProtectedRoute component={Map} />} />
          <Route path="/trip/:trip" element={<ProtectedRoute component={Trip} />} />
          <Route path="/users" element={<ProtectedRoute component={Users} />} />
          <Route path="/user/:user" element={<ProtectedRoute component={User} />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
