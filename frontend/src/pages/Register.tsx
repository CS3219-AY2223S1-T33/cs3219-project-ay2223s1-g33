import React from "react";
import RegisterForm from "../components/form/RegisterForm";
import UnauthLayout from "../components/ui/layout/UnauthLayout";

function Register() {
  return (
    <UnauthLayout heading="Sign up">
      <RegisterForm />
    </UnauthLayout>
  );
}

export default Register;
