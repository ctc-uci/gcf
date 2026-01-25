import { useEffect, useState } from "react";
import { Box, Button, Container, Heading, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { MediaGrid } from "./MediaGrid";

export const Media = () => {
  const { userId } = useParams();

  const [media, setMedia] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [programUpdatesData, setProgramUpdatesData] = useState([]);
  const [mediaChangesData, setMediaChangesData] = useState([]);
  const [programDirectorsData, setProgramDirectorsData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          programRes,
          programUpdatesRes,
          mediaChangesRes,
          programDirectorsRes,
        ] = await Promise.all([
          fetch("http://localhost:3001/program").then((res) => res.json()),
          fetch("http://localhost:3001/program-updates").then((res) =>
            res.json()
          ),
          fetch("http://localhost:3001/mediaChange").then((res) => res.json()),
          fetch("http://localhost:3001/program-directors").then((res) =>
            res.json()
          ),
        ]);

        setProgramData(programRes);
        setProgramUpdatesData(programUpdatesRes);
        setMediaChangesData(mediaChangesRes);
        setProgramDirectorsData(programDirectorsRes);

        // program dir to program
        const userProgramIds = programDirectorsRes
          .filter((director) => director.userId === userId)
          .map((director) => director.programId);

        // program to programupdates
        const userProgramUpdateIds = programUpdatesRes
          .filter((update) => userProgramIds.includes(update.programId))
          .map((update) => update.id);

        // programupdates to mediachange
        const filteredUserMedia = mediaChangesRes.filter((media) =>
          userProgramUpdateIds.includes(media.updateId)
        );

        const transformedMedia = filteredUserMedia.map((media) => ({
          id: media.id,
          s3_key: media.s3Key,
          file_name: media.fileName,
          file_type: media.fileType,
          is_thumbnail: media.isThumbnail,
        }));

        setMedia(transformedMedia);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    loadData();
  }, [userId]);

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" py={8}>
        <Box borderRadius="lg" p={8}>
          <VStack align="start" spacing={6} w="full">
            <Heading size="xl" color="gray.800">
              My Media
            </Heading>

            {/* this button just here cuz it was on the lofi doesnt do anything */}
            <Button
              variant="outline"
              bg="white"
              borderColor="gray.800"
              color="gray.800"
              _hover={{ bg: "gray.50" }}
            >
              + New
            </Button>

            <MediaGrid mediaItems={media} />
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};