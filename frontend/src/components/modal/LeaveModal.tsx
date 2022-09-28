import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  HStack,
  Button,
} from "@chakra-ui/react";
import React from "react";

type Props = {
  isLeaveModalOpen: boolean;
  onCloseLeaveModal: () => void;
  leaveSessionHandler: () => void;
};

function LeaveModal({
  isLeaveModalOpen,
  onCloseLeaveModal,
  leaveSessionHandler,
}: Props) {
  return (
    <Modal
      isOpen={isLeaveModalOpen}
      onClose={onCloseLeaveModal}
      size="xl"
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Leaving soon?</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          Leaving this session will also terminate this session with your buddy.
        </ModalBody>
        <ModalFooter>
          <HStack gap={4}>
            <Button
              variant="outline"
              colorScheme="green"
              onClick={onCloseLeaveModal}
            >
              Continue Session
            </Button>
            <Button colorScheme="red" onClick={leaveSessionHandler}>
              Leave Session
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default LeaveModal;
