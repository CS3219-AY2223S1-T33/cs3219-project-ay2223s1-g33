import axios from "axios";
import * as React from "react";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
	useEffect(() => {
		// Left here as a sanity checker
		axios.get("http://127.0.0.1:8081").then((res) => console.log(res.data));
	}, []);

	return (
		<Routes>
			<Route path="/" element={<Login />} />
			<Route path="/register" element={<Register />} />
		</Routes>
	);
}

export default App;
