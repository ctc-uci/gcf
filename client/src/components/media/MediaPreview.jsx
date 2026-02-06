import React, { useMemo, useState } from "react";

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
  VStack,
} from "@chakra-ui/react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";

export function MediaPreview({ file, onComplete }) {
  const { backend } = useBackendContext();

  const [title, setTitle] = useState(file.name);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const previewUrl = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  const handleFullUploadProcess = async () => {
    setIsUploading(true);

    try {
      const { data: s3Data } = await backend.post("/images/upload-url", {
        fileName: file.name,
        contentType: file.type,
      });

      if (!s3Data.uploadUrl || !s3Data.key) {
        throw new Error("Failed to get upload URL");
      }

      await backend.put(s3Data.uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      onComplete({
        s3_key: s3Data.key,
        file_name: file.name,
        title: title,
        description: description,
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

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
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel
          color="gray.500"
          fontWeight="normal"
          mb={1}
        >
          Description:
        </FormLabel>
        <Textarea
          bg="gray.100"
          border="none"
          borderRadius="xl"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>

      <Center pt={4}>
        <Button
          variant="outline"
          borderColor="black"
          borderRadius="xl"
          px={16}
          bg="gray.50"
          fontWeight="normal"
          isLoading={isUploading}
          loadingText="Uploading..."
          onClick={handleFullUploadProcess}
        >
          Upload
        </Button>
      </Center>
    </VStack>
  );
}
