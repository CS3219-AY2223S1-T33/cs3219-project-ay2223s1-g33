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
  Divider,
} from "@chakra-ui/react";
import ChangePasswordForm from "../form/ChangePasswordForm";
import ChangeNicknameForm from "../form/ChangeNicknameForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function AccountSettingsModal({ isOpen, onClose }: Props) {
  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      size="xl"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay />
      <ModalContent margin={4}>
        <ModalHeader bg="gray.50">Account Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={8}>
          <HStack spacing={8} justifyContent="center" alignItems="flex-start">
            <ChangePasswordForm />
            <Divider orientation="vertical" />
            <ChangeNicknameForm />
          </HStack>
        </ModalBody>
        <ModalFooter p={4} bg="gray.50">
          <Button onClick={onClose} colorScheme="red">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AccountSettingsModal;
