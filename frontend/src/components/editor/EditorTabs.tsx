import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
  Button,
  VStack
} from "@chakra-ui/react";
import React from "react";
import { Question } from "../../proto/types";
import QuestionSection from "../question/QuestionSection";

type Props = {
  question: Question | undefined;
  getQuestion: () => void;
};

function EditorTabs({ question, getQuestion }: Props) {
  return (
    <Tabs variant="enclosed" borderRight="1px solid #A0AEC0">
      <TabList>
        <Tab key="question">Question</Tab>
        <Tab key="chat">Chat</Tab>
        <Tab key="history">History</Tab>
      </TabList>

      <TabPanels>
        <TabPanel key="question_section" h="85vh" overflowY="scroll">
          {/* TODO Maybe have a refresh button? (Collab svc) */}
          {question ? (
            <QuestionSection question={question} />
          ) : (
            <VStack align="center" spacing={6}>
              <Text>Error: No question received.</Text>
              <Button onClick={getQuestion}>Get Question</Button>
            </VStack>
          )}
        </TabPanel>
        <TabPanel key="chat_section">
          <Text>Chat section</Text>
        </TabPanel>
        <TabPanel key="history_section">
          <Text>History section</Text>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default EditorTabs;
