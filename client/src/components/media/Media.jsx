import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Spinner,
  VStack,
} from "@chakra-ui/react";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useParams } from "react-router-dom";

import { MediaGrid } from "./MediaGrid";

export const Media = () => {
  // TODO(login): Replace useParams userId with AuthContext (currentUser?.uid) when auth flow is finalized.
  const { userId } = useParams();
  const { backend } = useBackendContext();

  const [media, setMedia] = useState([]);
  const [programName, setProgramName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [backend, userId]);

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

            {/* TODO: Implement functionality for button */}
            <Button
              variant="outline"
              bg="white"
              borderColor="gray.800"
              color="gray.800"
              _hover={{ bg: "gray.50" }}
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
    </Box>
  );
};
