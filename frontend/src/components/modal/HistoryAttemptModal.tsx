import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  HStack
} from "@chakra-ui/react";
import QuestionSection from "../question/QuestionSection";
import HistorySection from "../history/HistorySection";
import saveFile from "../../utils/fileDownloadUtil";
import { Language } from "../../types/types";
import { HistoryAttempt } from "../../proto/types";
import { GetAttemptSubmissionRequest } from "../../proto/history-service";
import useFixedToast from "../../utils/hooks/useFixedToast";
import HistoryAPI from "../../api/history";

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

  const { attemptId, users, question } = historyAttempt;
  const header = `Attempt #${attemptId} by ${users.join(", ")}`;
  const toast = useFixedToast();
  const [submission, setSubmission] = useState<string | undefined>();

  const loadSubmission = (targetAttemptId: number): Promise<HistoryAttempt> => {
    const request: GetAttemptSubmissionRequest = {
      attemptId: targetAttemptId
    };

    return HistoryAPI.getAttemptSubmission(request).then((res) => {
      const { attempt } = res;

      if (!attempt) {
        throw new Error("Something went wrong.");
      }

      return attempt;
    });
  };

  useEffect(() => {
    if (historyAttempt) {
      loadSubmission(historyAttempt.attemptId)
        .then((attempt) => {
          setSubmission(attempt.submission);
        })
        .catch((err) => {
          toast.sendErrorMessage(err.message);
        });
    } else {
      setSubmission(undefined);
    }
  }, [historyAttempt]);

  const saveFileHandler = () => {
    if (!submission) {
      return;
    }

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
            {/* Wtf? */}
            <QuestionSection question={question!} />
            <HistorySection
              submission={submission}
              language={historyAttempt.language as Language}
            />
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
