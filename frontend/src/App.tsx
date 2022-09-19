// import axios from "axios";
import React, { useEffect } from "react";
// import { Routes } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { RootState } from "./app/store";
import UnprotectedRoute from "./components/auth/UnprotectedRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const user = useSelector((state: RootState) => state.user.user);

  // eslint-disable-next-line
  const [cookies, setCookies, removeCookies] = useCookies(["session_token"]);

  useEffect(() => {
    // Always removes existing cookies until we properly implement persistence
    removeCookies("session_token");
  }, []);

  return (
    <BrowserRouter>
      {user ? <ProtectedRoute /> : <UnprotectedRoute />}
    </BrowserRouter>
  );
}

export default App;
