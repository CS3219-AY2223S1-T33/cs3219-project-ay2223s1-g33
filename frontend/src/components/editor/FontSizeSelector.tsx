import { Select, Text, Box } from "@chakra-ui/react";
import React, { ChangeEvent, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  changeFontSize,
  selectFontSize,
} from "../../feature/session/sessionSlice";

const DEFAULT_FONTSIZE = 12;
function FontSizeSelector() {
  const dispatch = useDispatch();
  const currentFontSize = useSelector(selectFontSize);

  const fontSizes = useMemo(
    () => Array.from({ length: 10 }, (_, i) => DEFAULT_FONTSIZE + 2 * i),
    []
  );

  const changeFontSizeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const newFontSize = parseInt(e.target.value, 10);
    dispatch(changeFontSize({ fs: newFontSize }));
  };

  return (
    <Box w="35%">
      <Text>Font Size: </Text>
      <Select value={currentFontSize} onChange={changeFontSizeHandler} w="90%">
        {fontSizes.map((f) => (
          <option value={f} key={f}>
            {f}
          </option>
        ))}
      </Select>
    </Box>
  );
}

export default FontSizeSelector;
