import { useToast, UseToastOptions } from "@chakra-ui/react";

const ERROR_TOAST: UseToastOptions = {
	title: "Error",
	status: "error",
	duration: 5000,
	isClosable: true,
	position: "top",
};

const SUCCESS_TOAST: UseToastOptions = {
	title: "Success!",
	status: "success",
	duration: 5000,
	isClosable: true,
	position: "top",
};

const ALERT_TOAST: UseToastOptions = {
	title: "Alert",
	status: "warning",
	duration: 5000,
	isClosable: true,
	position: "top",
};

const useFixedToast = () => {
	const toast = useToast();

	const sendErrorMessage = (description: string, options?: UseToastOptions) => {
		toast({ ...ERROR_TOAST, ...options, description });
	};

	const sendSuccessMessage = (description: string, options?: UseToastOptions) => {
		toast({ ...SUCCESS_TOAST, ...options, description });
	};

	const sendAlertMessage = (description: string, options?: UseToastOptions) => {
		toast({ ...ALERT_TOAST, ...options, description });
	};

	return { sendAlertMessage, sendErrorMessage, sendSuccessMessage };
};

export default useFixedToast;
