import { useEffect, useState } from 'react';

import { AspectRatio, Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

function LessonVideos() {
  const { currentUser } = useAuthContext();
  const userId = currentUser.uid;

  const { backend } = useBackendContext();
  const [playlists, setPlaylists] = useState([]);
  const [playlistVideos, setPlaylistVideos] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const res = await backend.get(
          `/program-directors/me/${userId}/playlist`
        );
        const playlistList = Array.isArray(res.data) ? res.data : [];
        setPlaylists(playlistList);
      } catch (err) {
        console.error('Error fetching playlists:', err);
      }
    };

    fetchData();
  }, [userId, backend]);

  // Extract all the videos in each playlist
  useEffect(() => {
    const getYoutubeVideos = async () => {
      try {
        const results = await Promise.all(
          playlists.map(async (playlist) => {
            const url = new URL(playlist.link);
            const playlistId = url.searchParams.get('list');
            console.log(playlistId);
            const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=5&key=${YOUTUBE_API_KEY}`)
            return res.json();
          })
      );
        const videos = playlists.map((playlist, index) => ({
          ...playlist,
          videos: results[index].items
        }));
        console.log(videos);
        setPlaylistVideos(videos);
        //console.log(playlistVideos);
      } catch (err) {
      console.error('Error fetching videos: ', err);
      }
    }
    getYoutubeVideos();
  }, [playlists]);

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
  const getYouTubeEmbedUrl = (video) => {
    const videoId = video.snippet.resourceId.videoId;
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <Box>
      <Heading size="md" mb={4}>
        Lesson Videos
      </Heading>
      {playlists.length === 0 && (
        <Text color="gray.500">No lesson videos available</Text>
      )}
      {playlistVideos.map((playlist) => {
        console.log(playlist);
        return (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {playlist.videos.map((video, index) => {
              const embedUrl = getYouTubeEmbedUrl(video);
              if (!embedUrl) return null;
              return (
                <Box
                  key={`${playlist.programId}-${video.link}-${index}`}
                  borderWidth="1px"
                  borderRadius="md"
                  overflow="hidden"
                >
                  <AspectRatio ratio={16 / 9}>
                    <iframe
                      src={embedUrl}
                      title={video.snippet.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ border: 0 }}
                    />
                  </AspectRatio>
                  <Box p={2}>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                      {video.snippet.title}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        );
      })}
    </Box>
  );
}

export default LessonVideos;
