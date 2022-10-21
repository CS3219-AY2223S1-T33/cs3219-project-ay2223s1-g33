import * as yup from "yup";

const LOGIN_VALIDATOR = yup.object().shape({
	email: yup.string().required("Please enter your email."),
	password: yup.string().required("Please enter your password."),
});

const REGISTER_VALIDATOR = yup.object().shape({
	nickname: yup.string().required("Please enter your nickname."),
	email: yup.string().required("Please enter your email."),
	password: yup.string().required("Please enter your password."),
});

export { LOGIN_VALIDATOR, REGISTER_VALIDATOR };
