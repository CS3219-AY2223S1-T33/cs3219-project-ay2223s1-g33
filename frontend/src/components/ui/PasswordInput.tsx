import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  useBoolean,
  InputGroup,
  Input,
  InputRightElement,
  Button
} from "@chakra-ui/react";
import React from "react";
import { UseFormRegister, FieldValues } from "react-hook-form";

type Props = {
  register: UseFormRegister<FieldValues>;
  formKey: string;
};
function PasswordInput({ register, formKey }: Props) {
  const [showPassword, setShowPassword] = useBoolean();
  const inputType = showPassword ? "text" : "password";

  return (
    <InputGroup>
      <Input type={inputType} {...register(formKey)} />
      <InputRightElement h="full">
        <Button variant="ghost" onClick={setShowPassword.toggle}>
          {showPassword ? <ViewIcon /> : <ViewOffIcon />}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}

export default PasswordInput;
