import { Grid, Code, ButtonGroup, Button, Text } from "@chakra-ui/react";
import React from "react";
import { FaSave } from "react-icons/fa";
import { VscVmRunning } from "react-icons/vsc";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

type Props = {
  executeCodeHandler: () => void;
  sendCodeSnapshotHandler: () => void;
};

function CodeExecution({ executeCodeHandler, sendCodeSnapshotHandler }: Props) {
  const { isExecuting, isEditorLocked, executionOutput } = useSelector(
    (state: RootState) => state.session
  );

  return (
    <Grid
      templateRows="1fr 3fr 1fr"
      py={4}
      px={6}
      gap={4}
      borderTop="1px solid #A0AEC0"
    >
      <Text fontSize="lg">Execution Output</Text>
      <Code display="block" whiteSpace="pre-wrap" overflowY="scroll">
        {executionOutput}
      </Code>
      <ButtonGroup gap={4}>
        <Button
          onClick={executeCodeHandler}
          isLoading={isExecuting}
          leftIcon={<VscVmRunning />}
        >
          Execute Code
        </Button>
        <Button
          onClick={sendCodeSnapshotHandler}
          isLoading={isEditorLocked}
          loadingText="Submitting..."
          leftIcon={<FaSave />}
        >
          Submit Code Snapshot
        </Button>
      </ButtonGroup>
    </Grid>
  );
}

export default CodeExecution;
