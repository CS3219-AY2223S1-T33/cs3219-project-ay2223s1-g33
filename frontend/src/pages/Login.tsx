import React from "react";
import LoginForm from "../components/form/LoginForm";
import UnauthLayout from "../components/ui/layout/UnauthLayout";

function Login() {
  return (
    <UnauthLayout heading="Peerprep">
      <LoginForm />
    </UnauthLayout>
  );
}

export default Login;
