import React, { useRef, useState } from 'react';

import { ChevronLeftIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

import { MediaPreview } from './MediaPreview';
import { MediaUpload } from './MediaUpload';

export function MediaUploadModal({ isOpen, onClose, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent borderRadius="md" pb={6}>
        {selectedFile && (
          <IconButton
            icon={<ChevronLeftIcon w={6} h={6} />}
            variant="ghost"
            position="absolute"
            left="15px"
            top="15px"
            onClick={() => setSelectedFile(null)}
            aria-label="Back"
          />
        )}
        <ModalCloseButton top="15px" right="15px" />

        <ModalHeader
          textAlign="center"
          fontSize="2xl"
          fontWeight="normal"
          mt={2}
        >
          Upload Media
        </ModalHeader>

        <ModalBody>
          {!selectedFile ? (
            <MediaUpload
              fileInputRef={fileInputRef}
              onFileSelect={(file) => setSelectedFile(file)}
            />
          ) : (
            <MediaPreview file={selectedFile} onComplete={onUploadComplete} />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
