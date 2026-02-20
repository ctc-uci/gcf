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

export function MediaPreview({ files, onComplete }) {
  const { backend } = useBackendContext();
  const toast = useToast();

  const [titles, setTitles] = useState(new Map());
  const [urls, setUrls] = useState(new Map());

  useEffect(() => {
    files.map((file) => {
      titles[file] = file.name.replace(/\.[^/.]+$/, "");
      urls[file] = URL.createObjectURL(file);
    })
    setTitles(titles);
    setUrls(urls);
  }, [files, titles, urls]);

  console.log(urls);

  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFullUploadProcess = async (file) => {
    setIsUploading(true);

    try {
      const extension = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : "";

      const keyFileName = `${titles[file].trim()}${extension}`;

      const { data: s3Data } = await backend.post("/images/upload-url", {
        fileName: keyFileName,
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
        file_name: keyFileName,
        title: title[file],
        description: description,
      });

      toast({
        title: "Upload successful.",
        description: `${keyFileName} has been uploaded to the server.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Upload failed:", error);

      toast({
        title: "Upload failed.",
        description: "There was an error uploading your file.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setIsUploading(false);
    }
  };



  return (
    <>
    {files.map((file) => {
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
                src={urls[file]}
                controls
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Image
                src={urls[file]}
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
            value={titles[file]}
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
      </VStack>
      )
    })}
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
          onClick={() => {
            files.map((file) => {
              return handleFullUploadProcess(file, titles[file]);
            })
        }}
        >
          Upload
        </Button>
      </Center>
  </>
  );
}
