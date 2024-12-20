import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { User } from "./interfaces";
import { fetchUsersPagination } from "../../fetchModels/fetchUsersPagination";
import Pagination from "../../components/Pagination";
import { usePagination } from "../../components/Pagination/usePagination";
import SearchList from "../../components/SearchList";

const Users: React.FC = () => {
	const {
	  currentPage,
	  totalPages,
	  searchQuery,
	  setTotalPages,
	  handleListSearch,
	  showNextPage,
	  showPrevPage,
	} = usePagination();

	const [users, setUsers] = useState<User[]>([]);
	const navigate = useNavigate();
  
	useEffect(() => {
	  document.title = "Users - Solo Scoot";
  
	  const fetchAndSetUsers = async () => {
		const result = await fetchUsersPagination(currentPage, searchQuery);
		setUsers(result.users);
		setTotalPages(result.totalPages);
	  };
  
	  fetchAndSetUsers();
	}, [currentPage, searchQuery]);
  
	const displayUser = (userId: string) => {
	  navigate(`/user/${userId}`);
	};
  
	return (
	  <div>
		<h1>Users</h1>
  
		<SearchList
			searchQuery={searchQuery}
			searchInput={handleListSearch} 
		/>
  
		<ul className="pagination-list">
		  {users.map((user, index) => (
			<li
			  key={user._id}
			  onClick={() => displayUser(user.user_id)}
			  className={index === users.length - 1 ? "li-last-in-list" : ""}
			>
			  {user.user_id}
			</li>
		  ))}
		</ul>
  
		<Pagination
		  currentPage={currentPage}
		  totalPages={totalPages}
		  nextPage={showNextPage}
		  prevPage={showPrevPage}
		/>
  
		<a href="/users/add" className="add-btn">
		  Add new user
		</a>
	  </div>
	);
  };
  
  export default Users;
