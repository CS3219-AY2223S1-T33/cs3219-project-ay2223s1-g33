import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../../pages/Home";
import Session from "../../pages/Session";

function ProtectedRoute() {
  console.log("Protected Rendered");
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/session/:sessionId" element={<Session />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default ProtectedRoute;
