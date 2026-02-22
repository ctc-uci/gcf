import { useCallback, useEffect, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await backend.get(`/mediaChange/${userId}/media`);

      const transformedMedia = response.data.media.map((media) => ({
        id: media.id,
        s3_key: media.s3Key,
        file_name: media.fileName,
        file_type: media.fileType,
        is_thumbnail: media.isThumbnail,
      }));

      setMedia(transformedMedia);
      setProgramName(response.data.programName);
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
        onUploadComplete={() => {
          fetchData();
          onClose();
        }}
      />
    </Box>
  );
};
