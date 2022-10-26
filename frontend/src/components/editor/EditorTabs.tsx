import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
  Button,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import QuestionSection from "../question/QuestionSection";
import HistoryTable from "../history/HistoryTable";
import ChatSection from "../chat/ChatSection";
import { RootState } from "../../app/store";

type Props = {
  getQuestion: () => void;
  sendTextMessage: (content: string) => void;
};

const hiddenColumns = ["attemptId", "question", "users", "difficulty"];

function EditorTabs({ getQuestion, sendTextMessage }: Props) {
  const question = useSelector((state: RootState) => state.session.question);

  return (
    <Tabs variant="enclosed" borderRight="1px solid #A0AEC0">
      <TabList>
        <Tab key="question">Question</Tab>
        <Tab key="chat">Chat</Tab>
        <Tab key="history">History</Tab>
      </TabList>

      <TabPanels>
        <TabPanel key="question_section" h="85vh" overflowY="scroll">
          {question ? (
            <QuestionSection question={question} showCompletion />
          ) : (
            <VStack align="center" spacing={6}>
              <Text>Error: No question received.</Text>
              <Button onClick={getQuestion}>Get Question</Button>
            </VStack>
          )}
        </TabPanel>
        <TabPanel key="chat_section">
          <ChatSection sendTextMessage={sendTextMessage} />
        </TabPanel>
        <TabPanel key="history_section">
          {question ? (
            <HistoryTable
              questionId={question.questionId}
              hiddenColumns={hiddenColumns}
            />
          ) : (
            <Text>No question provided</Text>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default EditorTabs;
