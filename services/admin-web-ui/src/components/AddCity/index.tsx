import React, { useEffect } from "react";
import AddCityForm from "../AddCityForm";

const AddBike: React.FC = () => {

  useEffect(() => {
    document.title = `Add city - Avec`;
  }, []);

  return (
    <div>
      <h1>Add city</h1>
      <AddCityForm />
    </div>
  );
};

export default AddBike;
