import { Button, Heading } from "@chakra-ui/react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../feature/user/userSlice";

function Home() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	// eslint-disable-next-line
	const [cookies, setCookies, removeCookies] = useCookies(["token"]);

	const logoutHandler = () => {
		removeCookies("token");
		dispatch(logout);
		navigate("/login", { replace: true });
	};

	return (
		<>
			<Heading>Hello world!</Heading>
			<Button onClick={logoutHandler}>Log me out</Button>
		</>
	);
}

export default Home;
