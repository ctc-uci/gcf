import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

export const MediaDeleteModal = ({ isOpen, onClose, onConfirm }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    isCentered
  >
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Are you sure you want to delete?</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>This action cannot be undone.</Text>
      </ModalBody>
      <ModalFooter>
        <Button
          colorScheme="gray"
          mr={3}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          colorScheme="red"
          onClick={onConfirm}
        >
          Delete Media
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
