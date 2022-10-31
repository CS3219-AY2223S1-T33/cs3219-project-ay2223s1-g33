import { Select, Text } from "@chakra-ui/react";
import React, { ChangeEvent } from "react";
import { useSelector } from "react-redux";
import { selectSelectedLanguage } from "../../feature/session/sessionSlice";

type Props = {
  isDisabled: boolean;
  changeLangHandler: (e: ChangeEvent<HTMLSelectElement>) => void;
};

function EditorLanguage({ isDisabled, changeLangHandler }: Props) {
  const selectedLang = useSelector(selectSelectedLanguage);

  return (
    <>
      <Text>Language: </Text>
      <Select
        value={selectedLang}
        isDisabled={isDisabled}
        onChange={changeLangHandler}
        w="30%"
      >
        {["javascript", "go", "java", "python"].map((l) => (
          <option value={l} key={l}>
            {l}
          </option>
        ))}
      </Select>
    </>
  );
}

export default EditorLanguage;
