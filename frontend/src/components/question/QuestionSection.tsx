import { Box, Divider, Heading, Text, VStack } from "@chakra-ui/react";
import React from "react";
import ConstraintsList from "./ConstraintsList";
import { QuestionDifficulty, Question } from "../../proto/types";
import difficultyColor from "../../utils/diffcultyColors";
import ExampleList from "./ExampleList";

type Props = {
  question: Question;
};

function QuestionSection({ question }: Props) {
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
      </Box>
      <Divider py={4} />
      <VStack spacing={4} align="start" id="question-content">
        {contentDecode.question.split("\n").map((ln: string) => (
          <Text>{ln}</Text>
        ))}
      </VStack>
      <ExampleList examples={contentDecode.example} />
      <ConstraintsList constraints={contentDecode.constrains} />
    </Box>
  );
}

export default QuestionSection;
