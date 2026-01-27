import { useEffect, useState } from "react";
import { Box, Button, Container, Heading, VStack } from "@chakra-ui/react";
import { MediaGrid } from "./MediaGrid";

import { useBackendContext } from "@/contexts/hooks/useBackendContext";
import { useParams } from "react-router-dom";

export const Media = () => {
  const { userId } = useParams();
  const { backend } = useBackendContext();
  const [media, setMedia] = useState([]);
  const [programName, setProgramName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        //response gets media[], programName
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
      <></>
    );
  }

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" py={8}>
        <Box borderRadius="lg" p={8}>
          <VStack align="start" spacing={6} w="full">
            <Heading size="xl" color="gray.800">
              {programName} Media
            </Heading>

            {/* [TODO: BUTTON FOR ADDING NEW MEDIA] */}
            <Button
              variant="outline"
              bg="white"
              borderColor="gray.800"
              color="gray.800"
              _hover={{ bg: "gray.50" }}
            >
              + New
            </Button>

            <MediaGrid mediaItems={media} programName={programName} />
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};