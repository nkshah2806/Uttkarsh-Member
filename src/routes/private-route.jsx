import React from "react";
import { Navigate, Outlet } from "react-router";
import Layout from "@/layout/layout";

function PrivateRoute() {
  const isLoggedIn = localStorage.getItem("isAuthenticated") === "true";
  return isLoggedIn? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/" replace />
  );
}

export default PrivateRoute;
  