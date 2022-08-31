import { Link as CLink } from "@chakra-ui/react";
import { Link as RLink, To } from "react-router-dom";

import React from "react";

type Props = {
	to: To;
	children: React.ReactNode;
};

function Link(props: Props) {
	const { to, children } = props;

	return (
		<CLink as={RLink} to={to} color="blue.400">
			{children}
		</CLink>
	);
}

export default Link;
