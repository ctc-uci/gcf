import { useEffect, useState } from "react";
import { Box, Heading, AspectRatio, Text, SimpleGrid } from "@chakra-ui/react";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";

// TODO(login): Replace userId prop with AuthContext (currentUser?.uid), or have parent pass it from AuthContext.
function LessonVideos({ userId }) {
  const { backend } = useBackendContext();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const res = await backend.get(`/program-directors/me/${userId}/playlist`);
        const playlistList = Array.isArray(res.data) ? res.data : [];
        setPlaylists(playlistList);
      } catch (err) {
        console.error("Error fetching playlists:", err);
      }
    };

    fetchData();
  }, [userId, backend]);

  // Extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <Box>
      <Heading size="md" mb={4}>
        Lesson Videos
      </Heading>
      {playlists.length === 0 && <Text color="gray.500">No lesson videos available</Text>}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {playlists.map((playlist, index) => {
          const embedUrl = getYouTubeEmbedUrl(playlist.link);
          if (!embedUrl) return null;
          
          return (
            <Box key={`${playlist.programId}-${playlist.link}-${index}`} borderWidth="1px" borderRadius="md" overflow="hidden">
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src={embedUrl}
                  title={playlist.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 0 }}
                />
              </AspectRatio>
              <Box p={2}>
                <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                  {playlist.name}
                </Text>
              </Box>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}

export default LessonVideos;
