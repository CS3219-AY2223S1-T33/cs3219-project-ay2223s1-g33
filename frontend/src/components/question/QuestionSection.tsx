/* eslint react/no-array-index-key: 0 */
import {
  Box,
  Code,
  Divider,
  Heading,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import React from "react";
import { QuestionDifficulty, Question } from "../../proto/types";
import difficultyColor from "../../utils/diffcultyColors";
import boldTestcaseKeyword from "../../utils/boldTestcaseKeyword";

function QuestionSection() {
  // Sample Input Data to be recieve from socket
  const question: Question = {
    questionId: 1,
    name: "Number of Dice Rolls With Target Sum",
    difficulty: 2,
    content: ``,
    solution: "ok",
  };
  // content should be destructure and parse
  const { questionId, name, difficulty } = question;
  const sampleData = {
    question:
      "You have n dice and each die has k faces numbered from 1 to k.\nGiven three integers n, k, and target, return the number of possible ways (out of the kn total ways) to roll the dice so the sum of the face-up numbers equals target. Since the answer may be too large, return it modulo 109 + 7.\n",
    example: [
      "Input: n = 1, k = 6, target = 3\nOutput: 1\nExplanation: You throw one die with 6 faces.\nThere is only one way to get a sum of 3.\n",
      "Input: n = 2, k = 6, target = 7\nOutput: 6\nExplanation: You throw two dice, each with 6 faces.\nThere are 6 ways to get a sum of 7: 1+6, 2+5, 3+4, 4+3, 5+2, 6+1.\n",
      "Input: n = 30, k = 30, target = 500\nOutput: 222616187\nExplanation: The answer must be returned modulo 109 + 7.\n",
    ],
    constrains: ["1 <= n, k <= 30", "1 <= target <= 1000"],
  };
  question.content = JSON.stringify(sampleData);
  const contentDecode = JSON.parse(question.content);
  return (
    <>
      <Box pb={4} id="title">
        <Heading as="h4" size="md" pb={2}>
          {questionId}. {name}
        </Heading>
        <Heading as="h5" size="sm" color={difficultyColor(difficulty)}>
          {QuestionDifficulty[difficulty].toString()}
        </Heading>
      </Box>
      <Divider />
      <Box pt={4} id="question-content">
        {contentDecode.question.split("\n").map((ln: string) => (
          <>
            <Text>{ln}</Text>
            <br />
          </>
        ))}
      </Box>
      <Box id="example-content">
        {contentDecode.example.map((example: string, id: number) => (
          <>
            <Text fontWeight="bold" key={`${id}-1`}>Example {id + 1}:</Text>
            <Code w="100%" p="4" mb="4" borderRadius={4} key={`${id}-2`}>
              {example.split("\n").map((ln, innerId) => (
                  <Text key={`${id}-${innerId}-1`}>
                    <b>{boldTestcaseKeyword(ln).keyword}</b>{boldTestcaseKeyword(ln).lnContent} 
                  </Text>
              ))}
            </Code>
          </>
        ))}
      </Box>
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
    </>
  );
}

export default QuestionSection;
