import React from "react";
import RowDetails from "./RowDetails";
import { TableRowProps } from "./interfaces";

const TableRow: React.FC<TableRowProps> = ({ row, rowIndex, selectedRow, toggleDetails }) => {
  	const isSelected = selectedRow === rowIndex;

	return (
		<>
		<tr className={isSelected ? "selected-row" : ""}>
			<td className={row.count === 0 ? "disabled" : ""}>{row.category}</td>
			<td className={row.count === 0 ? "disabled" : ""}>{row.count}</td>
			<td
			className={row.count === 0 ? "disabled" : ""}
			onClick={() => toggleDetails(rowIndex)}
			>
			<span className="show-hide">
				{row.count === 0 ? "None" : isSelected ? "Hide" : "Show"}
			</span>
			</td>
		</tr>
		{isSelected && <RowDetails data={row.data} />}
		</>
	);
};

export default TableRow;
