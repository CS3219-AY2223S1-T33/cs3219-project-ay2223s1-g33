// import axios from "axios";
// import { Routes } from "react-router-dom";
import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import UnprotectedRoute from "./components/auth/UnprotectedRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UserAPI from "./api/user";
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
			UserAPI.getUserProfile()
				.then((res) => {
					const { user: fetchedUser } = res;

					if (!fetchedUser) {
						throw new Error("No user fetched");
					}

					dispatch(login({ user: fetchedUser }));
				})
				.catch((err) => {
					toast.sendErrorMessage("Please log in again");
					console.error(err.message);
				});
		}
	}, []);

	return <BrowserRouter>{user ? <ProtectedRoute /> : <UnprotectedRoute />}</BrowserRouter>;
}

export default App;
