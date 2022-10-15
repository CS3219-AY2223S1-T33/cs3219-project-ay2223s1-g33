import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import ResetPassword from "../../pages/ResetPassword";
import SetNewPassword from "../../pages/SetNewPassword";

function UnprotectedRoute() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/resetToken" element={<SetNewPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default UnprotectedRoute;
