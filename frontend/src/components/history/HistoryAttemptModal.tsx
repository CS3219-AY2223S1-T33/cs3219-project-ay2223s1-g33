import React from "react";
import {
  useDisclosure,
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
import { Question } from "../../proto/types";
import QuestionSection from "../question/QuestionSection";
import HistorySection from "./HistorySection";
import saveFile from "../../utils/fileDownloadUtil";
import { Language } from "../../types";

type Props = {
  submission: string;
  question: Question;
  attemptId: number;
  users: string[];
  language: string;
};

function HistoryAttemptModal({
  question,
  submission,
  attemptId,
  users,
  language,
}: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} colorScheme="blue">
        View
      </Button>

      <Modal
        onClose={onClose}
        isOpen={isOpen}
        size="full"
        scrollBehavior="inside"
        isCentered
      >
        <ModalOverlay />
        <ModalContent margin={4}>
          <ModalHeader>{`Attempt #${attemptId} by ${users.join(
            ", "
          )}`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack spacing="24px">
              <QuestionSection question={question} />
              <HistorySection submission={submission} />
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="red" mr={3}>
              Close
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => saveFile(submission, language as Language)}
            >
              Download
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default HistoryAttemptModal;
