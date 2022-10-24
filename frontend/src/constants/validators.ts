import * as yup from "yup";

const AUTH_SCHEMA = {
  email: yup.string().email().required("Please enter your email."),
  password: yup.string().required("Please enter your password."),
  confirmPassword: yup
    .string()
    .required("Please enter your confirmed password.")
    .oneOf([yup.ref("password"), "Please ensure your passwords match."]),
};

const LOGIN_VALIDATOR = yup.object().shape(AUTH_SCHEMA);

const REGISTER_VALIDATOR = yup.object().shape({
  ...AUTH_SCHEMA,
  nickname: yup.string().required("Please enter your nickname."),
});

const RESET_PW_VALIDATIOR = yup.object().shape({
  email: AUTH_SCHEMA.email,
});

const SET_PW_VALIDATOR = yup.object().shape({
  password: AUTH_SCHEMA.password,
  confirmPassword: AUTH_SCHEMA.confirmPassword,
});

export {
  LOGIN_VALIDATOR,
  REGISTER_VALIDATOR,
  RESET_PW_VALIDATIOR,
  SET_PW_VALIDATOR,
};
