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

import { MediaPreview } from "./MediaPreview";
import { MediaUpload } from "./MediaUpload";

export function MediaUploadModal({ isOpen, onClose, onUploadComplete, formOrigin }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const handleClose = () => {
    setSelectedFiles(null);
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
            onClick={() => setSelectedFiles(null)}
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
                onFileSelect={(files) => setSelectedFiles(files)}
                formOrigin={formOrigin}
              />
                
          {/* {selectedFiles.length > 0 ?
            (<>
              {selectedFiles.map((file) => {
                return ( */}
                <MediaPreview
                  files={selectedFiles}
                  onComplete={onUploadComplete}
                />
              {/* )
              }
              )}
            </>) : ""
          } */}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
