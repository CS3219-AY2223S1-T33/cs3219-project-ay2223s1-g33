import React from "react";
import ResetPasswordForm from "../components/form/ResetPasswordForm";
import UnauthLayout from "../components/ui/layout/UnauthLayout";

function ResetPassword() {
  return (
    <UnauthLayout heading="Reset Password">
      <ResetPasswordForm />
    </UnauthLayout>
  );
}

export default ResetPassword;
