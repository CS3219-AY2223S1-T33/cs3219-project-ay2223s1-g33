import { Button, Grid, Input } from "@chakra-ui/react";
import { MdSend } from "react-icons/md";
import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../../feature/chat/chatSlice";
import { RootState } from "../../app/store";

type Props = {
  sendTextMessage: (content: string) => void;
};

function ChatInput({ sendTextMessage }: Props) {
  const dispatch = useDispatch();
  const nickname = useSelector((state: RootState) => state.user.user?.nickname);
  const [inputMsg, setInputMsg] = useState("");

  if (!nickname) {
    return null;
  }

  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setInputMsg(e.target.value);
  };

  const sendMessageHandler = () => {
    if (inputMsg === "") {
      return;
    }

    sendTextMessage(inputMsg);
    dispatch(addMessage({ from: nickname, message: inputMsg }));
    setInputMsg("");
  };

  const keyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") {
      return;
    }

    sendMessageHandler();
  };

  return (
    <Grid templateColumns="75% 25%" alignSelf="flex-end" w="100%">
      <Input
        type="text"
        value={inputMsg}
        onChange={inputChangeHandler}
        onKeyDown={keyDownHandler}
      />
      <Button
        rightIcon={<MdSend />}
        onClick={sendMessageHandler}
        disabled={inputMsg.length === 0}
      >
        Send
      </Button>
    </Grid>
  );
}

export default ChatInput;
