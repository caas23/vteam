import React from "react";
import { SearchProps } from "./interfaces";
import "./index.css";

const SearchInput: React.FC<SearchProps> = ({ 
  searchQuery, 
  bikeSearchInput 
}) => {
  return (
    <div className="search-bike">
      <input
        placeholder="Search ..."
        value={searchQuery}
        onChange={bikeSearchInput}
      />
    </div>
  );
};

export default SearchInput;
