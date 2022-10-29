import {
  // Badge,
  Box,
  // Button,
  Divider,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import CompletionStatus from "./CompletionStatus";
// import axios from "axios";
import ConstraintsList from "./ConstraintsList";
import {
  QuestionDifficulty,
  Question,
  // HistoryCompletion,
} from "../../proto/types";
import difficultyColor from "../../utils/difficultyColors";
import ExampleList from "./ExampleList";
import { RootState } from "../../app/store";
// import { selectUser } from "../../feature/user/userSlice";
// import {
//   SetHistoryCompletionRequest,
//   SetHistoryCompletionResponse,
// } from "../../proto/history-service";
// import useFixedToast from "../../utils/hooks/useFixedToast";
// import { changeIsCompleted } from "../../feature/session/sessionSlice";
import { CompletionConfig } from "../../types";

type Props = {
  question: Question;
};

const COMPLETED: CompletionConfig = {
  colorScheme: "green",
  badgeText: "COMPLETED",
  btnText: "Not Complete",
};

const NOT_COMPLETED: CompletionConfig = {
  colorScheme: "gray",
  badgeText: "NOT COMPLETED",
  btnText: "Complete",
};

function QuestionSection({ question }: Props) {
  const isCompleted = useSelector(
    (state: RootState) => state.session.isCompleted
  );

  const { questionId, name, difficulty, content } = question;

  const contentDecode = JSON.parse(content.replace(/\n/g, "\\".concat("n")));

  const completeConf = isCompleted ? COMPLETED : NOT_COMPLETED;

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
          <CompletionStatus
            config={completeConf}
            question={question}
            isCompleted={isCompleted}
          />
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
