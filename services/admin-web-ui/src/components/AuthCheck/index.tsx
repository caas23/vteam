import React from "react";
import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
  return sessionStorage.getItem("access_token") !== null;
};

interface ProtectedRouteProps<P> {
  component: React.ComponentType<P>;
  // props sent via ProtectedRoute are passed on to the component
  [key: string]: any;
}

const ProtectedRoute = <P extends object>({
  component: Component,
  ...props
}: ProtectedRouteProps<P>) => {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/"
        state={{ message: "You need to be logged in to access this page." }}
      />
    );
  }

  return <Component {...props as P} />;
};

export default ProtectedRoute;
