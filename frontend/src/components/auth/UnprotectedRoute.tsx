import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../../pages/Login";
import Register from "../../pages/Register";

function UnprotectedRoute() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default UnprotectedRoute;
