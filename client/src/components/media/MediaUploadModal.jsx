import React, { useState } from "react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

import { MediaUpload } from "./MediaUpload";
import { MediaPreviewList } from "./MediaPreviewList";

export function MediaUploadModal({ isOpen, onClose, onUploadComplete, formOrigin }) {
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
        pb={6}
      >
        {selectedFiles && (
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
          <MediaUpload
                onFileSelect={(files) =>
                  formOrigin === "profile" ? setSelectedFiles(files.slice(0,1)) :
                  setSelectedFiles((prev) => [...(prev || []), ...files])} // append instead of replace upon another upload, unless profile
                formOrigin={formOrigin}
              />
            {console.log(selectedFiles)}
            {selectedFiles?.length > 0 && (
              <MediaPreviewList
                files={selectedFiles}
                onComplete={onUploadComplete}
              />
            )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
