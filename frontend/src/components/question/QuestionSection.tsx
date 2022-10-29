import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  Text,
  VStack
} from "@chakra-ui/react";
import React from "react";
import ConstraintsList from "./ConstraintsList";
import { QuestionDifficulty, Question } from "../../proto/types";
import difficultyColor from "../../utils/difficultyColors";
import ExampleList from "./ExampleList";

type Props = {
  question: Question;
  isCompleted?: boolean;
  onToggle?: () => void;
};

function QuestionSection({ question, isCompleted, onToggle }: Props) {
  const { questionId, name, difficulty, content } = question;

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
            <Button size="sm" onClick={onToggle}>
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
