import React from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function AdminRoute() {
  const { currentUser } = useSelector((state) => state.user);

  if (currentUser && currentUser.user_role === 1) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
}