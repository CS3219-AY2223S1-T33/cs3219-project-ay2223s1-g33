import React from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  HStack,
  Box,
} from "@chakra-ui/react";
import QuestionSection from "../question/QuestionSection";
import HistorySection from "../history/HistorySection";
import saveFile from "../../utils/fileDownloadUtil";
import { Language } from "../../types";
import { HistoryAttempt } from "../../proto/types";

type Props = {
  historyAttempt: HistoryAttempt | undefined;
  isOpen: boolean;
  onClose: () => void;
};

function HistoryAttemptModal({ historyAttempt, isOpen, onClose }: Props) {
  return (
    <Box>
      {historyAttempt === undefined ? undefined : (
        <Modal
          onClose={onClose}
          isOpen={isOpen}
          size="full"
          scrollBehavior="inside"
          isCentered
        >
          <ModalOverlay />
          <ModalContent margin={4}>
            <ModalHeader>{`Attempt #${
              historyAttempt.attemptId
            } by ${historyAttempt.users.join(", ")}`}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <HStack spacing="24px" alignItems="flex-start">
                <QuestionSection question={historyAttempt.question!} />
                <HistorySection submission={historyAttempt.submission} />
              </HStack>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                onClick={() =>
                  saveFile(
                    historyAttempt.submission,
                    historyAttempt.language as Language
                  )
                }
                mr={3}
              >
                Download
              </Button>
              <Button onClick={onClose} colorScheme="red">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}

export default HistoryAttemptModal;
