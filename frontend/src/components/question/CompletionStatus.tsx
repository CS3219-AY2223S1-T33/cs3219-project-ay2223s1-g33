import { Badge, Button } from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { changeIsCompleted } from "../../feature/session/sessionSlice";
import {
  SetHistoryCompletionRequest,
  SetHistoryCompletionResponse,
} from "../../proto/history-service";
import { HistoryCompletion, Question } from "../../proto/types";
import { CompletionConfig } from "../../types";
import useFixedToast from "../../utils/hooks/useFixedToast";

type Props = {
  config: CompletionConfig;
  question: Question;
  isCompleted: boolean | undefined;
};

function CompletionStatus({ config, question, isCompleted }: Props) {
  const username = useSelector((state: RootState) => state.user.user)?.username;
  const dispatch = useDispatch();
  const toast = useFixedToast();

  const toggleCompletionHandler = () => {
    if (!username) {
      return;
    }

    const { questionId } = question;

    const completed: HistoryCompletion = { questionId, username };
    const request: SetHistoryCompletionRequest = { completed };
    axios
      .post<SetHistoryCompletionResponse>(
        "/api/user/history/completion",
        request,
        { withCredentials: true }
      )
      .then((res) => {
        const { errorMessage } = res.data;

        if (errorMessage !== "") {
          throw new Error(errorMessage);
        }

        // setIsCompleted((prev) => !prev);
        dispatch(changeIsCompleted({ isComplete: !isCompleted }));
      })
      .catch((err) => {
        toast.sendErrorMessage(err.message);
      });
  };

  return (
    <>
      {" "}
      <Badge colorScheme={config.colorScheme} size="lg" fontWeight="bold">
        {config.badgeText}
      </Badge>
      <br />
      <Button size="sm" onClick={toggleCompletionHandler}>
        Mark as {config.btnText}
      </Button>
    </>
  );
}

export default CompletionStatus;
