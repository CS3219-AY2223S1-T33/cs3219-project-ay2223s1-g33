import axios from "axios";
import * as React from "react";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useCookies } from "react-cookie";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
	// eslint-disable-next-line
	const [cookies, setCookies, removeCookies] = useCookies(["token"]);

	useEffect(() => {
		// Left here as a sanity checker
		// Note this does not use the axios instance
		axios.get("http://127.0.0.1:8081").then((res) => console.log(res.data));

		// Always removes existing cookies until we properly implement persistence
		removeCookies("token");
	}, []);

	return (
		<Routes>
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<Home />
					</ProtectedRoute>
				}
			/>
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
		</Routes>
	);
}

export default App;
