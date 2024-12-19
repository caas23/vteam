import React from "react";
import { SearchProps } from "./interfaces";
import "./index.css";

const SearchInput: React.FC<SearchProps> = ({ 
  searchQuery, 
  searchInput 
}) => {
  return (
    <div className="search">
      <input
        placeholder="Search ..."
        value={searchQuery}
        onChange={searchInput}
      />
    </div>
  );
};

export default SearchInput;
