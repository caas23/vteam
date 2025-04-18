import { useState } from "react";

export const usePagination = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleListSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // to get the correct numbering when searching
  };

  const showNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const showPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    searchQuery,
    setSearchQuery,
    handleListSearch,
    showNextPage,
    showPrevPage,
  };
};
