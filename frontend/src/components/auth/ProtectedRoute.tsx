import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../../app/store";

interface Props {
	children: JSX.Element;
}

function ProtectedRoute({ children }: Props) {
	const token = useSelector((state: RootState) => state.user.sessionToken);

	console.log(token);
	return token === "" ? <Navigate to="/login" /> : children;
}

export default ProtectedRoute;
