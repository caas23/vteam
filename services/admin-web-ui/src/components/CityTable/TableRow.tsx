import React from "react";
import ShowRowDetails from "./ShowRowDetails";
import { CityTableRowProps } from "./interfaces";

const TableRow: React.FC<CityTableRowProps> = ({
  row,
  rowIndex,
  selectedRow,
  toggleDetails,
}) => {
  const isSelected = selectedRow === rowIndex;

  return (
    <>
      <tr className={isSelected ? "selected-row" : ""}>
        <td>{row.category}</td>
        <td>{row.count}</td>
        <td onClick={() => toggleDetails(rowIndex)}>
          <span className="show-hide">{isSelected ? "Hide" : "Show"}</span>
        </td>
      </tr>
      {isSelected && <ShowRowDetails data={row.data} />}
    </>
  );
};

export default TableRow;
