import React, { useState } from 'react';

import { ChevronLeftIcon } from '@chakra-ui/icons';
import {
  Box,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

import { MediaPreviewList } from './MediaPreviewList';
import { MediaUpload } from './MediaUpload';

export function MediaUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  formOrigin,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size="xl"
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="md"
        maxW="60vw"
        pb={6}
      >
        {selectedFiles && selectedFiles.length > 0 && (
          <IconButton
            icon={
              <ChevronLeftIcon
                w={6}
                h={6}
              />
            }
            variant="ghost"
            position="absolute"
            left="15px"
            top="15px"
            onClick={() => setSelectedFiles([])}
            aria-label="Back"
          />
        )}
        <ModalCloseButton
          top="15px"
          right="15px"
        />

        <ModalHeader
          textAlign="center"
          fontSize="2xl"
          fontWeight="normal"
          mt={2}
        >
          Upload Media
        </ModalHeader>

        <ModalBody>
          <Box
            display="flex"
            gap={6}
          >
            <Box flex={1}>
              <MediaUpload
                onFileSelect={(files) =>
                  formOrigin === 'profile'
                    ? setSelectedFiles(files.slice(0, 1))
                    : setSelectedFiles((prev) => [...(prev || []), ...files])
                }
                formOrigin={formOrigin}
              />
            </Box>
            {selectedFiles?.length > 0 && (
              <Box
                w="50%"
                overflowY="auto"
                maxH="500px"
              >
                <MediaPreviewList
                  files={selectedFiles}
                  onComplete={(uploadedFiles, description) => {
                    onUploadComplete?.(uploadedFiles, description);
                    handleClose();
                  }}
                  formOrigin={formOrigin}
                />
              </Box>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
