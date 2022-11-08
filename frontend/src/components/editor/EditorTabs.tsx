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
import CodeMirror from "@uiw/react-codemirror";
import { Language } from "../../types/types";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";

type Props = {
  getQuestion: () => void;
  sendTextMessage: (content: string) => void;
};

const hiddenColumns = ["attemptId", "question", "users", "difficulty"];

function EditorTabs({ getQuestion, sendTextMessage }: Props) {
  const question = useSelector((state: RootState) => state.session.question);
  const language : Language = "java" as Language;
  const lang: any = loadLanguage(language);
  return (
    <Tabs
      variant="enclosed"
      borderRight="1px solid #A0AEC0">
      <TabList>
        <Tab key="question">Question</Tab>
        <Tab key="chat">Chat</Tab>
        <Tab key="history">History</Tab>
        <Tab key="solution">Solution</Tab>
      </TabList>

      <TabPanels>
        <TabPanel
          key="question_section"
          h="85vh"
          overflowY="scroll">
          {question ? (
            <QuestionSection question={question} />
          ) : (
            <VStack
              align="center"
              spacing={6}>
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
        <TabPanel key="solution_section">
        <CodeMirror
          value={question?.solution}
          extensions={[lang]}
          style={{ overflowY: "auto", width: "100%", height: "75vh" }}
          editable={false}
        />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default EditorTabs;
