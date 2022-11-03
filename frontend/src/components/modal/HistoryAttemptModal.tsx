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
  Grid,
} from "@chakra-ui/react";
import axios from "axios";
import QuestionSection from "../question/QuestionSection";
import HistorySection from "../history/HistorySection";
import saveFile from "../../utils/fileDownloadUtil";
import { Language } from "../../types";
import { HistoryAttempt } from "../../proto/types";
import {
  GetAttemptSubmissionRequest,
  GetAttemptSubmissionResponse,
} from "../../proto/history-service";
import useFixedToast from "../../utils/hooks/useFixedToast";

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

  const loadSubmission = async (
    targetAttemptId: number
  ): Promise<HistoryAttempt> => {
    const request: GetAttemptSubmissionRequest = {
      attemptId: targetAttemptId,
    };
    const res = await axios.post<GetAttemptSubmissionResponse>(
      "/api/user/history/submission",
      request,
      {
        withCredentials: true,
      }
    );

    const { errorMessage } = res.data;
    if (errorMessage !== "") {
      throw new Error(errorMessage);
    }

    const { attempt } = res.data;
    if (!attempt) {
      throw new Error("Something went wrong.");
    }

    return attempt;
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
          {/* <HStack spacing="24px" alignItems="flex-start"> */}
          <Grid templateColumns="2fr 3fr" gap={6}>
            <QuestionSection question={question!} />
            <HistorySection
              submission={submission}
              language={historyAttempt.language as Language}
            />
          </Grid>

          {/* </HStack> */}
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
