import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AddBike from "./components/AddBike";
import Bike from "./components/Bike";
import Callback from "./components/Callback";
import City from "./components/City";
import AddCity from "./components/AddCity";
import MapComponent from "./components/Map";
import Trip from "./components/Trip";
import Home from "./views/Home";
import Bikes from "./views/Bikes";
import Cities from "./views/Cities";
import Maps from "./views/Maps";
import Users from "./views/Users";
import User from "./components/User";
import ProtectedRoute from "./components/AuthCheck";
import io from 'socket.io-client';

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
		const handleUserChange = () => {
		  updateUserStatus();
		};
	
		window.addEventListener("userStorage", handleUserChange);
	
		return () => {
		  window.removeEventListener("userStorage", handleUserChange);
		};
	}, []);

  const [bikeUsers, setBikeUsers] = useState<Map<string, string>>(new Map());

  const updateBikeUsers = () => {
    const storedBikeUsers = localStorage.getItem("bikeUsers");
    setBikeUsers(storedBikeUsers ? new Map(Object.entries(JSON.parse(storedBikeUsers))) : new Map());
  };

  useEffect(() => {
    const handleBikeUsers = () => {
      updateBikeUsers();
    };

    window.addEventListener("bikeUserStorage", handleBikeUsers);

    updateBikeUsers();

    return () => {
      window.removeEventListener("bikeUserStorage", handleBikeUsers);
    };
  }, []);

  const socket = useRef<ReturnType<typeof io> | null>(null);

  // hantera nya och avslutade rutter här, så att localstorage
  // uppdateras med cykel+användare oavsett vilken vy som är öppen
  useEffect(() => {
    if (!socket.current) {
      socket.current = io("http://localhost:1337");
    }
  
    socket.current?.on("routeStarted", (data: { 
      bikeId: string;
      user: string 
    }) => {
      setBikeUsers((prev) => {
        const updatedUsers = new Map(prev);
        updatedUsers.set(data.bikeId, data.user);
        localStorage.setItem("bikeUsers", JSON.stringify(Object.fromEntries(updatedUsers)));
        return updatedUsers;
      });
    });

    socket.current?.on("routeFinished", (data: { 
      bikeId: string 
    }) => {
      setBikeUsers((prev) => {
        const updatedUsers = new Map(prev);
        updatedUsers.delete(data.bikeId);
        localStorage.setItem("bikeUsers", JSON.stringify(Object.fromEntries(updatedUsers)));
        return updatedUsers;
      });
    });

    return () => {
      socket.current?.off("routeStarted");
      socket.current?.off("routeFinished");
      socket.current?.disconnect();
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
          {/* skicka med socket till kartvyn --> behöver inte initera ny anslutning i vyn */}
          <Route path="/map/:city" element={<ProtectedRoute component={MapComponent} bikeUsers={bikeUsers} socket={socket} />} />
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
