import { useToast, UseToastOptions } from "@chakra-ui/react";

const TOAST_BASIC: UseToastOptions = {
  duration: 5000,
  isClosable: true,
  position: "top",
};

const ERROR_TOAST: UseToastOptions = {
  ...TOAST_BASIC,
  title: "Error",
  status: "error",
};

const SUCCESS_TOAST: UseToastOptions = {
  ...TOAST_BASIC,
  title: "Success!",
  status: "success",
};

const ALERT_TOAST: UseToastOptions = {
  ...TOAST_BASIC,
  title: "Alert",
  status: "warning",
};

const INFO_TOAST: UseToastOptions = {
  ...TOAST_BASIC,
  title: "Info",
  status: "info",
};

const useFixedToast = () => {
  const toast = useToast();

  const sendErrorMessage = (description: string, options?: UseToastOptions) => {
    toast({ ...ERROR_TOAST, ...options, description });
  };

  const sendSuccessMessage = (
    description: string,
    options?: UseToastOptions
  ) => {
    toast({ ...SUCCESS_TOAST, ...options, description });
  };

  const sendAlertMessage = (description: string, options?: UseToastOptions) => {
    toast({ ...ALERT_TOAST, ...options, description });
  };

  const sendInfoMessage = (description: string, options?: UseToastOptions) => {
    toast({ ...INFO_TOAST, ...options, description });
  };

  return {
    sendAlertMessage,
    sendErrorMessage,
    sendInfoMessage,
    sendSuccessMessage,
  };
};

export default useFixedToast;
