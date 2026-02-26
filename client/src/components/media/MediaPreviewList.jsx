import { useState, useEffect } from "react";

import {
  Button,
  Center,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { MediaPreview } from "./MediaPreview";

export function MediaPreviewList({ files, onComplete, formOrigin }) {
    const { backend } = useBackendContext();
    const toast = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const [titles, setTitles] = useState([]);
    
    const [folder, setFolder] = useState("");
    const [description, setDescription] = useState("");

    // keep titles array in sync with files prop
    useEffect(() => {
        setTitles((prev) => {
            return files.map((file, idx) => {
                if (prev && prev[idx]) {
                    return prev[idx];
                }
                return file.name.replace(/\.[^/.]+$/, "");
            });
        });
    }, [files]);

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
                    s3_key: s3Data.key,
                    file_name: keyFileName.replace(/\s+/g, '_'),
                    file_type: file.type,
                    title: titles[i],
                    description: description,
                    instrument_id: null,
                })
            }

        onComplete(results, description);

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
            <VStack spacing={0} align="stretch">
                <FormLabel
                    color="gray.500"
                    fontWeight="bold"
                >
                    Uploaded Files
                </FormLabel>
                {files.map((file, i) => (
                    <MediaPreview
                        key={file.name + i}
                        file={file}
                        title={titles[i]}
                        onTitleChange={(val) => updateTitle(i, val)}
                    />
                ))}
            </VStack>
            {formOrigin !== "profile" && (
                <>
                    <FormControl>
                        <FormLabel
                            color="gray.500"
                            fontWeight="normal"
                            mb={1}
                        >
                            Select Folder
                        </FormLabel>
                        <Select
                            border="2px solid"
                            borderRadius="md"
                            borderColor="gray.100"
                            value={folder}
                            onChange={(e) => setFolder(e.target.value)}
                            placeholder="Instrument"
                        >
                            {/* TODO: get actual instruments from table */}
                            <option value="1">Guitar</option>
                            <option value="2">Ukulele</option>
                            <option value="3">Flute</option>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel
                            color="gray.500"
                            fontWeight="normal"
                            mb={1}
                        >
                            Notes
                        </FormLabel>
                        <Textarea
                            border="2px solid"
                            borderRadius="md"
                            borderColor="gray.100"
                            rows={3}
                            value={description}
                            placeholder="Add Notes"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormControl>
                </>
            )}
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