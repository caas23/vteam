import React from "react";
import { PaginationProps } from "./interfaces";
import "./index.css";

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  nextPage,
  prevPage,
}) => {
  return (
    <div className="pagination">
      <button 
        className="prev-next"
        onClick={prevPage}
        disabled={currentPage === 1}>
        Previous
      </button>
      <span className="page-number">
        {currentPage} / {totalPages}
      </span>
      <button
        className="prev-next"
        onClick={nextPage}
        disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
