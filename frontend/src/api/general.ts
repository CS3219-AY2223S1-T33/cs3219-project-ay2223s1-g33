import axios, { AxiosResponse } from "axios";

type ErrorResponse = {
	errorCode?: number;
	errorMessage: string;
};

const throwIfError = <T extends ErrorResponse>(res: AxiosResponse<T, any>) => {
	const { errorCode, errorMessage } = res.data;

	if (errorCode !== undefined && !errorCode) {
		return;
	}

	if (errorMessage === "") {
		return;
	}

	throw new Error(errorMessage);
};

const sendRequest = <Req, Res extends ErrorResponse>(url: string, req: Req, withCredentials?: boolean) =>
	axios.post<Res>(url, req, { withCredentials }).then((res) => {
		throwIfError(res);

		return res.data;
	});

export { sendRequest, throwIfError };
