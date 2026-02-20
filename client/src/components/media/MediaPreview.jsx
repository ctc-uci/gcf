import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Image,
  Input,
  Spinner,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";

export function MediaPreview({ file, title, onTitleChange }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <VStack
        spacing={4}
        align="stretch"
      >
        <VStack spacing={2}>
          <Text fontSize="md">Preview</Text>
          <Box
            border="1px solid black"
            w="100%"
            h="250px"
            overflow="hidden"
            borderRadius="md"
          >
            {file.type.startsWith("video") ? (
              <video
                src={previewUrl}
                controls
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Image
                src={previewUrl}
                alt="Preview"
                w="100%"
                h="100%"
                objectFit="contain"
                onLoad={() => console.log("Image loaded successfully")}
                fallback={
                  <Center h="100%">
                    <Spinner size="lg" />
                  </Center>
                }
              />
            )}
          </Box>
        </VStack>

        <FormControl>
          <FormLabel
            color="gray.500"
            fontWeight="normal"
            mb={1}
          >
            Title:
          </FormLabel>
          <Input
            bg="gray.100"
            border="none"
            borderRadius="full"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </FormControl>
      </VStack>
  );
}