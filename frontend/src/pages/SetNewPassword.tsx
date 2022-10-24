import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import SetNewPasswordForm from "../components/form/SetNewPasswordForm";
import UnauthLayout from "../components/ui/layout/UnauthLayout";

function SetNewPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <UnauthLayout heading="Reset Password">
      <SetNewPasswordForm token={token} />
    </UnauthLayout>
  );
}

export default SetNewPassword;
