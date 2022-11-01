import { Select, Text } from "@chakra-ui/react";
import React, { ChangeEvent, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  changeFontSize,
  selectFontSize
} from "../../feature/session/sessionSlice";

function FontSizeSelector() {
  const dispatch = useDispatch();
  const currentFontSize = useSelector(selectFontSize);

  const fontSizes = useMemo(
    () => Array.from({ length: 10 }, (_, i) => 14 + 2 * i),
    []
  );

  const changeFontSizeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const newFontSize = parseInt(e.target.value, 10);
    dispatch(changeFontSize({ fs: newFontSize }));
  };

  return (
    <>
      <Text>Language: </Text>
      <Select value={currentFontSize} onChange={changeFontSizeHandler} w="30%">
        {fontSizes.map((f) => (
          <option value={f} key={f}>
            {f}
          </option>
        ))}
      </Select>
    </>
  );
}

export default FontSizeSelector;
