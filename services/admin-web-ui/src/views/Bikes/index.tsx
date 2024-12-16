import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { Bike } from "./interfaces";
import { fetchBikesPagination } from "../../fetchModels/fetchBikesPagination";
import Pagination from "../../components/PaginationBikes";
import { usePagination } from "../../components/PaginationBikes/usePagination";
import SearchBikes from "../../components/SearchBikes";

const Bikes: React.FC = () => {
	const {
	  currentPage,
	  totalPages,
	  searchQuery,
	  setTotalPages,
	  handleBikeSearch,
	  showNextPage,
	  showPrevPage,
	} = usePagination();

	const [bikes, setBikes] = useState<Bike[]>([]);
	const navigate = useNavigate();
  
	useEffect(() => {
	  document.title = "Bikes - Avec";
  
	  const fetchAndSetBikes = async () => {
		const result = await fetchBikesPagination(currentPage, searchQuery);
		setBikes(result.bikes);
		setTotalPages(result.totalPages);
	  };
  
	  fetchAndSetBikes();
	}, [currentPage, searchQuery]);
  
	const displayBike = (bikeId: string) => {
	  navigate(`/bike/${bikeId}`);
	};
  
	return (
	  <div>
		<h1>Bikes</h1>
  
		<SearchBikes
			searchQuery={searchQuery}
			bikeSearchInput={handleBikeSearch} 
		/>
  
		<ul className="bike-list">
		  {bikes.map((bike, index) => (
			<li
			  key={bike._id}
			  onClick={() => displayBike(bike.bike_id)}
			  className={index === bikes.length - 1 ? "li-last-bike" : ""}
			>
			  {bike.bike_id}
			</li>
		  ))}
		</ul>
  
		<Pagination
		  currentPage={currentPage}
		  totalPages={totalPages}
		  nextPage={showNextPage}
		  prevPage={showPrevPage}
		/>
  
		<a href="/bikes/add" className="add-bike-btn">
		  Add new bike
		</a>
	  </div>
	);
  };
  
  export default Bikes;
