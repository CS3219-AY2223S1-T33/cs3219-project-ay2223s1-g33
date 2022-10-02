import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
} from "@chakra-ui/react";
import React from "react";
import QuestionSection from "../question/QuestionSection";

function EditorTabs() {
  return (
    <Tabs variant="enclosed" borderRight="1px solid #A0AEC0">
      <TabList>
        <Tab key="question">Question</Tab>
        <Tab key="chat">Chat</Tab>
        <Tab key="history">History</Tab>
      </TabList>

      <TabPanels>
        <TabPanel key="question_section">
          <QuestionSection />
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
