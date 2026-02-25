import { useEffect, useState, useCallback } from "react";

import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Spinner,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

import { useAuthContext } from "@/contexts/hooks/useAuthContext";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";

import { MediaGrid } from "./MediaGrid";
import { MediaUploadModal } from "./MediaUploadModal";

export const Media = () => {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { backend } = useBackendContext();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [media, setMedia] = useState([]);
  const [programName, setProgramName] = useState("");
  const [programId, setProgramId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const onUploadCompleteHandler = async (uploadedFiles,description) => {
    try {
      const updateDate = new Date().toISOString().split('T')[0];
      const programUpdateResponse = await backend.post("/program-updates", {
        title: "Media Upload",
        program_id: programId,
        created_by: userId,
        update_date: updateDate,
        note: description || "Media files uploaded",
      });;

      const updateId = programUpdateResponse.data.id;

      const newMediaItems = [];
      for (const file of uploadedFiles) {
        const mediaChangeResponse = await backend.post("/mediaChange", {
          update_id: updateId,
          s3_key: file.s3_key,
          file_name: file.file_name,
          file_type: file.file_type || "image",
          is_thumbnail: false,
          description: file.description,
          instrument_id: file.instrument_id,
        });

        const urlResponse = await backend.get(
          `/images/url/${encodeURIComponent(file.s3_key)}`
        );

        newMediaItems.push({
          id: mediaChangeResponse.data.id,
          s3_key: file.s3_key,
          file_name: file.file_name,
          file_type: file.file_type || "image",
          is_thumbnail: false,
          imageUrl: urlResponse.data.url,
        });
      }

      setMedia((prevMedia) => [...newMediaItems, ...prevMedia]);
      fetchData();
    } catch (error) {
      console.error("Error saving uploaded files:", error);
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await backend.get(`/mediaChange/${userId}/media`);

      const transformedMedia = await Promise.all(
        response.data.media.map(async (media) => {
          const urlResponse = await backend.get(
            `/images/url/${encodeURIComponent(media.s3Key)}`
          );
          return {
            id: media.id,
            s3_key: media.s3Key,
            file_name: media.fileName,
            file_type: media.fileType,
            is_thumbnail: media.isThumbnail,
            imageUrl: urlResponse.data.url,
          };
        })
      );

      setMedia(transformedMedia);
      setProgramName(response.data.programName);
      setProgramId(response.data.programId);
    } catch (error) {
      console.error("Error loading media data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [backend, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Center>
    );
  }

  return (
    <Box minH="100vh">
      <Container
        maxW="container.xl"
        py={8}
      >
        <Box
          borderRadius="lg"
          p={8}
        >
          <VStack
            align="start"
            spacing={6}
            w="full"
          >
            <Heading
              size="xl"
              color="gray.800"
            >
              {programName} Media
            </Heading>

            <Button
              variant="outline"
              bg="white"
              borderColor="gray.800"
              color="gray.800"
              _hover={{ bg: "gray.50" }}
              onClick={onOpen}
            >
              + New
            </Button>

            <MediaGrid
              mediaItems={media}
              programName={programName}
            />
          </VStack>
        </Box>
      </Container>
      <MediaUploadModal
        isOpen={isOpen}
        onClose={onClose}
        onUploadComplete={onUploadCompleteHandler}
      />
    </Box>
  );
};
