import { useEffect, useState } from "react";
import { Box, Heading, AspectRatio, Text, Image, SimpleGrid } from "@chakra-ui/react";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";

// TODO(login): Replace userId prop with AuthContext (currentUser?.uid), or have parent pass it from AuthContext.
function LessonVideos({ userId }) {
  const { backend } = useBackendContext();
  const [media, setMedia] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const res = await backend.get(`/program-directors/me/${userId}/media`);
        const mediaList = Array.isArray(res.data) ? res.data : [];
        setMedia(mediaList);
      } catch (err) {
        console.error("Error fetching media:", err);
      }
    };

    fetchData();
  }, [userId, backend]);

  const isVideo = (fileType) => fileType?.startsWith("video");
  const isImage = (fileType) => fileType?.startsWith("image");

  return (
    <Box>
      <Heading size="md" mb={4}>
        Program Media
      </Heading>
      {media.length === 0 && <Text color="gray.500">No media available</Text>}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {media.map((m) => (
          <Box key={m.id} borderWidth="1px" borderRadius="md" overflow="hidden">
            {isVideo(m.fileType) && (
              <AspectRatio ratio={16 / 9}>
                <video controls src={m.s3Key}>
                  Your browser does not support the video tag.
                </video>
              </AspectRatio>
            )}
            {isImage(m.fileType) && (
              <AspectRatio ratio={16 / 9}>
                <Image src={m.s3Key} alt={m.fileName} objectFit="cover" />
              </AspectRatio>
            )}
            <Box p={2}>
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                {m.fileName}
              </Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default LessonVideos;
