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
  if (!historyAttempt) {
    onClose();
    return null;
  }

  const { attemptId, users, question, submission } = historyAttempt;
  const header = `Attempt #${attemptId} by ${users.join(", ")}`;

  const saveFileHandler = () => {
    saveFile(submission, historyAttempt.language as Language);
  };

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      size="full"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay />
      <ModalContent margin={4}>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack spacing="24px" alignItems="flex-start">
            <QuestionSection question={question!} />
            <HistorySection submission={submission} />
          </HStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={saveFileHandler} mr={3}>
            Download
          </Button>
          <Button onClick={onClose} colorScheme="red">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default HistoryAttemptModal;
