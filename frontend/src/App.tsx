// import axios from "axios";
// import { Routes } from "react-router-dom";
import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import UnprotectedRoute from "./components/auth/UnprotectedRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import axios from "./axios";
import { GetUserProfileResponse } from "./proto/user-service";
import { login, selectUser } from "./feature/user/userSlice";
import useFixedToast from "./utils/hooks/useFixedToast";

// Workaround to double useEffect calls for React.StrictMode
let firstMount = true;

function App() {
  const toast = useFixedToast();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // eslint-disable-next-line
  const [cookies, setCookies, removeCookies] = useCookies(["AUTH-SESSION"]);

  useEffect(() => {
    if (cookies["AUTH-SESSION"] && firstMount) {
      console.log("Auth session exists");
      firstMount = false;
      axios
        .post<GetUserProfileResponse>(
          "/api/user/profile",
          {},
          { withCredentials: true }
        )
        .then((res) => {
          const { errorMessage, user: fetchedUser } = res.data;

          if (!fetchedUser) {
            throw new Error(errorMessage);
          }

          dispatch(login({ user: fetchedUser }));
        })
        .catch((err) => {
          toast.sendErrorMessage("Please log in again");
          console.error(err.message);
        });
    }
  }, []);

  return (
    <BrowserRouter>
      {user ? <ProtectedRoute /> : <UnprotectedRoute />}
    </BrowserRouter>
  );
}

export default App;
