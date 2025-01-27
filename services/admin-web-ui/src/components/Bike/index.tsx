import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import { Bike as BikeInterface } from "./interfaces";
import BikeDetails from "./BikeDetails";
import { fetchOneBike } from "../../fetchModels/fetchOneBike";

const Bike: React.FC = () => {
  const { bike: bikeId } = useParams<{ bike: string }>();
  const [bikeData, setBikeData] = useState< BikeInterface | null | undefined >(undefined);

  useEffect(() => {
    document.title = `Bike ${bikeId} - Solo Scoot`;

    const fetchBikeData = async () => {
      if (!bikeId) {
        setBikeData(null);
        return;
      }
      try {
        const result = bikeId ? await fetchOneBike(bikeId) : "";
        setBikeData(result ?? null); //null if no data
      } catch {
        setBikeData(null); // null if error
      }
    };
    
    fetchBikeData();

  }, [bikeId]);

  // undefined until result fetched
  if (bikeData === undefined) return;

  if (bikeData === null) {
    return (
      <div>
        <h1>Bike {bikeId}</h1>
        <p>No data related to the given bike was found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Bike {bikeId}</h1>
        <BikeDetails data={bikeData} />
    </div>
  );
};

export default Bike;
