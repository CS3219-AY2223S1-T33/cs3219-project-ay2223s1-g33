import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../../pages/Login";
import Register from "../../pages/Register";

// interface Props {
//   children: JSX.Element;
// }

// function UnprotectedRoute({ children }: Props) {
function UnprotectedRoute() {
  // const token = useSelector((state: RootState) => state.user.sessionToken);

  // return token !== "" ? <Navigate to="/login" /> : children;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default UnprotectedRoute;
