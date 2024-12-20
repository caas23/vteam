import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import { User as UserInterface } from "./interfaces";
import UserDetails from "./UserDetails";
import { fetchOneUser } from "../../fetchModels/fetchOneUser";

const User: React.FC = () => {
  const { user: userId } = useParams<{ user: string }>();
  const [userData, setUserData] = useState< UserInterface | null | undefined >(undefined);

  useEffect(() => {
    document.title = `User ${userId} - Solo Scoot`;

    const fetchUserData = async () => {
      if (!userId) {
        setUserData(null);
        return;
      }
      try {
        const result = userId ? await fetchOneUser(userId) : "";
        setUserData(result[0] ?? null);
      } catch {
        setUserData(null);
      }
    };
    
    fetchUserData();

  }, [userId]);

  if (userData === undefined) return;

  if (userData === null) {
    return (
      <div>
        <h1>User {userId}</h1>
        <p>No data related to the given user was found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>User {userId}</h1>
        <UserDetails data={userData} />
    </div>
  );
};

export default User;
