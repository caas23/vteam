import React from "react";
import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
  return sessionStorage.getItem("access_token") !== null;
};

const ProtectedRoute: React.FC<{ component: React.ComponentType }> = ({
  component: Component,
}) => {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/"
        state={{ message: "You need to be logged in to access this page." }}
      />
    );
  }

  return <Component />;
};

export default ProtectedRoute;
