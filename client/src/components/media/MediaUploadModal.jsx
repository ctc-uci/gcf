import React, { useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Center,
  useDisclosure,
  VStack,
  Text,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Box,
  IconButton,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';

function MediaUploadModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleBack = () => setFile(null);

  const resetAndClose = () => {
    setFile(null);
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen}>Open Upload Modal</Button>

      <Modal isOpen={isOpen} onClose={resetAndClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="md" pb={6}>
          {file && (
            <IconButton
              icon={<ChevronLeftIcon w={6} h={6} />}
              variant="ghost"
              position="absolute"
              left="15px"
              top="15px"
              onClick={handleBack}
              aria-label="Back"
            />
          )}
          <ModalCloseButton top="15px" right="15px" />

          <ModalHeader textAlign="center" fontSize="2xl" fontWeight="normal" mt={2}>
            Upload Media
          </ModalHeader>

          <ModalBody>
            {!file ? (
              <MediaUpload fileInputRef={fileInputRef} handleFileChange={handleFileChange} />
            ) : (
              <MediaPreview file={file} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}