import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import ConstraintsList from "./ConstraintsList";
import {
  QuestionDifficulty,
  Question,
  HistoryCompletion,
} from "../../proto/types";
import difficultyColor from "../../utils/difficultyColors";
import ExampleList from "./ExampleList";
import { RootState } from "../../app/store";
import { selectUser } from "../../feature/user/userSlice";
import {
  SetHistoryCompletionRequest,
  SetHistoryCompletionResponse,
} from "../../proto/history-service";
import useFixedToast from "../../utils/hooks/useFixedToast";
import { changeIsCompleted } from "../../feature/session/sessionSlice";

type Props = {
  question: Question;
  // showCompletion?: boolean;
};

function QuestionSection({ question }: Props) {
  const isCompleted = useSelector(
    (state: RootState) => state.session.isCompleted
  );
  const username = useSelector(selectUser)?.username;
  const toast = useFixedToast();
  const dispatch = useDispatch();

  const { questionId, name, difficulty, content } = question;

  const toggleCompletionHandler = () => {
    if (!username) {
      return;
    }

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

  const contentDecode = JSON.parse(content.replace(/\n/g, "\\".concat("n")));

  return (
    <Box>
      <Box id="title">
        <Heading as="h4" size="md" pb={2}>
          {questionId}. {name}
        </Heading>
        <Heading as="h5" size="sm" color={difficultyColor(difficulty)}>
          {QuestionDifficulty[difficulty].toString()}
        </Heading>
        {isCompleted !== undefined && (
          <>
            <Badge
              colorScheme={isCompleted ? "green" : "gray"}
              size="lg"
              fontWeight="bold"
            >
              {isCompleted ? "COMPLETED" : "NOT COMPLETED"}
            </Badge>
            <br />
            <Button size="sm" onClick={toggleCompletionHandler}>
              Mark as {isCompleted ? "Not Complete" : "Complete"}
            </Button>
          </>
        )}
      </Box>
      <Divider py={4} />
      <VStack spacing={4} id="question-content" alignItems="flex-start">
        {contentDecode.question.split("\n").map((ln: string) => (
          <Text key={ln.substring(0, 5)}>{ln}</Text>
        ))}
      </VStack>
      <ExampleList examples={contentDecode.example} />
      <ConstraintsList constraints={contentDecode.constrains} />
    </Box>
  );
}

export default QuestionSection;
