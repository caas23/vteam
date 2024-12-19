import React from "react";
import ShowRowDetails from "./ShowRowDetails";
import { CityTableRowProps } from "./interfaces";

const TableRow: React.FC<CityTableRowProps> = ({
  row,
  rowIndex,
  selectedRow,
  toggleDetails,
  onDelete
}) => {
  const isSelected = selectedRow === rowIndex;

  const handleDeleteClick = () => {
    if (row.data && row.data[0]) {
      const item = row.data[0];
      let id;
  
      if ('bike_id' in item) {
        id = item.bike_id;
      } else if ('charging_id' in item) {
        id = item.charging_id;
      } else if ('parking_id' in item) {
        id = item.parking_id;
      } else if ('rule_id' in item) {
        id = item.rule_id;
      }
  
      if (id) {
        onDelete(row.category, id);
      }
    }
  };
  

  return (
    <>
      <tr className={isSelected ? "selected-row" : ""}>
        <td className={row.count === 0 ? "disabled" : ""}>{row.category}</td>
        <td className={row.count === 0 ? "disabled" : ""}>{row.count}</td>
        <td 
          className={row.count === 0 ? "disabled" : ""}
          onClick={() => toggleDetails(rowIndex)}>
          <span className="show-hide">{row.count === 0 ? "None" : isSelected ? "Hide" : "Show"}</span>
        </td>
      </tr>
      {isSelected && <ShowRowDetails data={row.data} onDelete={handleDeleteClick}/>}
    </>
  );
};

export default TableRow;
