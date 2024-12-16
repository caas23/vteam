import React from "react";
import RowDetails from "./RowDetails";
import { CityShowRowDetailsProps } from "./interfaces";

const ShowRowDetails: React.FC<CityShowRowDetailsProps> = ({ data }) => {
  return (
    <tr className="selected-row">
      <td colSpan={3}>
        {data.map((item, index) => (
          <RowDetails key={index} item={item} />
        ))}
      </td>
    </tr>
  );
};

export default ShowRowDetails;
