import { Select, Text } from "@chakra-ui/react";
import React, { ChangeEvent } from "react";

type Props = {
  selectedLang: string;
  isDisabled: boolean;
  changeLangHandler: (e: ChangeEvent<HTMLSelectElement>) => void;
};

function EditorLanguage({
  selectedLang,
  isDisabled,
  changeLangHandler,
}: Props) {
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
