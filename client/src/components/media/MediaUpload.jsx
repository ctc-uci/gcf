import React from "react";

import { Button, Center } from "@chakra-ui/react";

export function MediaUpload({ fileInputRef, onFileSelect }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    onFileSelect(file);
  };

  return (
    <Center height="300px">
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.mp4"
      />
      <Button
        variant="outline"
        px={12}
        py={6}
        borderColor="black"
        borderRadius="lg"
        fontWeight="normal"
        onClick={() => fileInputRef.current.click()}
      >
        Select Files
      </Button>
    </Center>
  );
}
