import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text
} from "@chakra-ui/react";
import React from "react";
import { Question } from "../../proto/types";
import QuestionSection from "../question/QuestionSection";

type Props = {
  question: Question | undefined;
};

function EditorTabs({ question }: Props) {
  // TODO Remove when implementation properly done
  console.log("Using dummy question");
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
            <Text>Error: No question received.</Text>
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
