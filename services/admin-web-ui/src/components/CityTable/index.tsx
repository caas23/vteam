import React, { useState } from "react";
import "./index.css";
import TableRow from "./TableRow";
import { CityTableProps } from "./interfaces";

const CityTable: React.FC<CityTableProps> = ({ rows}) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const toggleDetails = (index: number) => {
    setSelectedRow(selectedRow === index ? null : index);
  };

  return (
    <table className="city-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Count</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <TableRow
            key={index}
            row={row}
            rowIndex={index}
            selectedRow={selectedRow}
            toggleDetails={toggleDetails}
          />
        ))}
      </tbody>
    </table>
  );
};

export default CityTable;
