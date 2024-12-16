import React, { useEffect } from "react";
import AddBikeForm from "../AddBikeForm";

const AddBike: React.FC = () => {

  useEffect(() => {
    document.title = `Add bike - Avec`;
  }, []);


  return (
    <div>
      <h1>Add bike</h1>
      <AddBikeForm />
    </div>
  );
};

export default AddBike;
