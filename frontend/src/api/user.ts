import axios from "axios";
import { GetUserProfileResponse } from "../proto/user-service";

const getUserProfile = () =>
	axios.post<GetUserProfileResponse>("/api/user/profile", {}, { withCredentials: true }).then((res) => {
		const { errorMessage } = res.data;

		if (errorMessage !== "") {
			throw new Error(errorMessage);
		}

		return res.data;
	});

// eslint-disable-next-line
export default { getUserProfile };
