import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
} from "@chakra-ui/react";
import React from "react";

function EditorTabs() {
  return (
    <Tabs variant="enclosed" borderRight="1px solid #A0AEC0">
      <TabList>
        <Tab>Question</Tab>
        <Tab>Chat</Tab>
        <Tab>History</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Text>Question section</Text>
        </TabPanel>
        <TabPanel>
          <Text>Chat section</Text>
        </TabPanel>
        <TabPanel>
          <Text>History section</Text>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default EditorTabs;
