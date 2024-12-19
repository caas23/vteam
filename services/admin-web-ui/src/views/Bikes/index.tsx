import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { Bike } from "./interfaces";
import { fetchBikesPagination } from "../../fetchModels/fetchBikesPagination";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../components/Pagination/usePagination";
import SearchList from "../../components/SearchList";

const Bikes: React.FC = () => {
	const {
	  currentPage,
	  totalPages,
	  searchQuery,
	  setTotalPages,
	  handleListSearch,
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
  
		<SearchList
			searchQuery={searchQuery}
			searchInput={handleListSearch} 
		/>
  
		<ul className="pagination-list">
		  {bikes.map((bike, index) => (
			<li
			  key={bike._id}
			  onClick={() => displayBike(bike.bike_id)}
			  className={index === bikes.length - 1 ? "li-last-in-list" : ""}
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
  
		<a href="/bikes/add" className="add-btn">
		  Add new bike
		</a>
	  </div>
	);
  };
  
  export default Bikes;
