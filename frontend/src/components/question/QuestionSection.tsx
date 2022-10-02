/* eslint react/no-array-index-key: 0 */
import {
  Box,
  Code,
  Divider,
  Heading,
  ListItem,
  Text,
  UnorderedList
} from "@chakra-ui/react";
import React from "react";
import { QuestionDifficulty, Question } from "../../proto/types";
import difficultyColor from "../../utils/diffcultyColors";
import ExampleList from "./ExampleList";

type Props = {
  question: Question;
};

function QuestionSection({ question }: Props) {
  // TODO: Blocker - backend need to send question thru ws. Temp implementation
  const { questionId, name, difficulty, content } = question;

  const contentDecode = JSON.parse(content.replace(/\n/g, "\\".concat("n")));

  return (
    <Box>
      <Box
        // pb={4}
        id="title"
      >
        <Heading as="h4" size="md" pb={2}>
          {questionId}. {name}
        </Heading>
        <Heading as="h5" size="sm" color={difficultyColor(difficulty)}>
          {QuestionDifficulty[difficulty].toString()}
        </Heading>
      </Box>
      <Divider py={4} />
      <Box
        // pt={4}
        id="question-content"
      >
        {/* To HW: Maybe VStack it? */}
        {contentDecode.question.split("\n").map((ln: string) => (
          <>
            <Text>{ln}</Text>
            <br />
          </>
        ))}
      </Box>
      <ExampleList examples={contentDecode.example} />
      <Box>
        <Text fontWeight="bold">Constraints</Text>
        <UnorderedList pl={4}>
          {contentDecode.constrains.map((constrain: string, id: number) => (
            <ListItem key={id}>
              <Code key={id}>{constrain}</Code>
            </ListItem>
          ))}
        </UnorderedList>
      </Box>
    </Box>
  );
}

export default QuestionSection;
