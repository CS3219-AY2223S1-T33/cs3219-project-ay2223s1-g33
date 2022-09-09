import axios from "axios";
import React, { useEffect } from "react";
// import { Routes } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { RootState } from "./app/store";
import UnprotectedRoute from "./components/auth/UnprotectedRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const sessionToken = useSelector(
    (state: RootState) => state.user.sessionToken
  );
  // console.log(sessionToken);

  // eslint-disable-next-line
  const [cookies, setCookies, removeCookies] = useCookies(["session_token"]);

  useEffect(() => {
    // Left here as a sanity checker
    // Note this does not use the axios instance
    axios.get("http://127.0.0.1:8081").then((res) => console.log(res.data));

    // Always removes existing cookies until we properly implement persistence
    removeCookies("session_token");
  }, []);

  return (
    <BrowserRouter>
      {sessionToken !== "" ? <ProtectedRoute /> : <UnprotectedRoute />}
    </BrowserRouter>
  );
}

export default App;
