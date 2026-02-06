import {
    Button,
    Center,
    VStack,
    Text,
    Input,
    Textarea,
    FormControl,
    FormLabel,
    Box,
} from '@chakra-ui/react';

import { useBackendContext } from "../context/BackendContext";
import axios from "axios";

export function MediaPreview({ file }) {

    // Inside your UploadModal component:
    const { backend } = useBackendContext();
    const [isUploading, setIsUploading] = React.useState(false);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setIsUploading(true);

        try {
            // 1. Get the pre-signed URL using your backend axios instance
            // This uses your baseURL (VITE_BACKEND_HOSTNAME) and auth interceptors
            const { data } = await backend.post("/images/upload-url", {
                fileName: selectedFile.name,
                contentType: selectedFile.type,
            });

            const { uploadUrl } = data;

            // 2. Upload directly to S3
            // We use a "fresh" axios call here because we DON'T want your 
            // backend's baseURL or auth headers sent to Amazon's servers.
            await axios.put(uploadUrl, selectedFile, {
                headers: { "Content-Type": selectedFile.type },
            });

            // 3. Success: Show the preview
            setFile(selectedFile);
        } catch (error) {
            console.error("Upload process failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <VStack spacing={4} align="stretch">
                <VStack spacing={2}>
                    <Text fontSize="md">Preview</Text>
                    <Box
                        border="1px solid black"
                        w="100%"
                        h="200px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                    >
                        <Box
                            w={0} h={0}
                            borderTop="15px solid transparent"
                            borderBottom="15px solid transparent"
                            borderLeft="25px solid black"
                            ml={2}
                        />
                    </Box>
                </VStack>

                <FormControl>
                    <FormLabel color="gray.500" fontWeight="normal" mb={1}>Title:</FormLabel>
                    <Input bg="gray.100" border="none" borderRadius="full" />
                </FormControl>

                <FormControl>
                    <FormLabel color="gray.500" fontWeight="normal" mb={1}>Description:</FormLabel>
                    <Textarea bg="gray.100" border="none" borderRadius="xl" rows={3} />
                </FormControl>

                <Center pt={4}>
                    <Button
                        variant="outline"
                        borderColor="black"
                        borderRadius="xl"
                        px={16}
                        bg="gray.50"
                        fontWeight="normal"
                        _hover={{ bg: 'gray.200' }}
                    >
                        Upload
                    </Button>
                </Center>
            </VStack>
        </>
    )
}