import React, { useState } from "react";

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
import { MediaPreview } from "./MediaPreview";

export function MediaPreviewList({ files, onComplete }) {
    const { backend } = useBackendContext();
    const toast = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const [titles, setTitles] = useState(() =>
        files.map((file) => file.name.replace(/\.[^/.]+$/, ""))
    );
    
    const [description, setDescription] = useState("");

    const updateTitle = (index, value) => {
        setTitles((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        })
    };

    const handleFullUploadProcess = async () => {
        setIsUploading(true);
        const results = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                const extension = file.name.includes(".")
                    ? file.name.slice(file.name.lastIndexOf("."))
                    : "";
                
                const keyFileName = `${titles[i].trim()}${extension}`;

                const { data: s3Data } = await backend.post("/images/upload-url", {
                    key: keyFileName
                });
                
                console.log("file name:", s3Data.uploadUrl)

                if (!s3Data.uploadUrl || !s3Data.key) {
                    throw new Error("Failed to get upload URL");
                }

                await backend.put(s3Data.uploadUrl, file, {
                    baseURL: "",
                    headers: { "Content-Type": file.type },
                });
                
                results.push({
                    s3_key: s3Data.uploadUrl,
                    file_name: s3Data.key,
                    title: titles[i],
                    description: description,
                })
            }

        onComplete(results);

        toast({
            title: "Upload successful.",
            description: `All files have been uploaded to the server.`,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom-right",
        });
        } catch (error) {
        console.error("Upload failed:", error);

        toast({
            title: "Upload failed.",
            description: "There was an error uploading 1 of more of your files.",
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
        <VStack spacing={6} align="stretch">
            {files.map((file, i) => (
                <MediaPreview
                    key={file.name + i}
                    file={file}
                    title={titles[i]}
                    onTitleChange={(val) => updateTitle(i, val)}
                />
            ))}
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
    )
}