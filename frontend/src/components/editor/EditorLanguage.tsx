import { Select, Text, Box } from "@chakra-ui/react";
import React, { ChangeEvent } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { selectSelectedLanguage } from "../../feature/session/sessionSlice";

type Props = {
  changeLangHandler: (e: ChangeEvent<HTMLSelectElement>) => void;
};

function EditorLanguage({ changeLangHandler }: Props) {
  const selectedLang = useSelector(selectSelectedLanguage);
  const wsStatus = useSelector((state: RootState) => state.session.wsStatus);

  return (
    <Box w="75%">
      <Text>Language: </Text>
      <Select
        value={selectedLang}
        isDisabled={wsStatus !== "Connected"}
        onChange={changeLangHandler}
        w="90%"
      >
        {["javascript", "go", "java", "python"].map((l) => (
          <option value={l} key={l}>
            {l}
          </option>
        ))}
      </Select>
    </Box>
  );
}

export default EditorLanguage;
