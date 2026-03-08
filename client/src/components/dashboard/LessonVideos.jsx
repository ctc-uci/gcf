import { useEffect, useState } from 'react';

import {
  AspectRatio,
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { FiFolder } from 'react-icons/fi';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';

import VideoPlayer from './VideoPlayer'
import { getYouTubeEmbedUrl } from '@/utils/youtube';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

function LessonVideos({ selectedPlaylist, setSelectedPlaylist, selectedVideo, setSelectedVideo }) {
  const { currentUser } = useAuthContext();
  const userId = currentUser.uid;

  const { backend } = useBackendContext();
  const [playlists, setPlaylists] = useState([]);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [instruments, setInstruments] = useState({});

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

  useEffect(() => {
    async function fetchInstruments() {
      try {
        const response = await backend.get('/instruments');
        const instruments = response.data;

        const instrumentMap = {};
        instruments.forEach((instrument) => {
          instrumentMap[instrument.id] = instrument.name;
        });
        setInstruments(instrumentMap);
      } catch (error) {
        console.error('Error fetching instruments:', error);
      }
    }
    fetchInstruments();
    console.log(instruments);
  }, [backend]);

  // Extract all the videos in each playlist
  useEffect(() => {
    const getYoutubeVideos = async () => {
      try {
        const results = await Promise.all(
          playlists.map(async (playlist) => {
            const url = new URL(playlist.link);
            const playlistId = url.searchParams.get('list');
            const res = await fetch(
              `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=10&key=${YOUTUBE_API_KEY}`
            );
            return res.json();
          })
        );
        const videos = {};
        playlists.forEach((playlist, index) => {
          const instrumentName = instruments[playlist.instrumentId];
          if (!videos[instrumentName]) {
            videos[instrumentName] = [];
          }
          videos[instrumentName].push(...results[index].items);
        });
        const videosArray = Object.entries(videos).map(
          ([instrumentName, videos]) => ({
            instrumentName,
            videos,
          })
        );

        console.log(videosArray);
        setPlaylistVideos(videosArray);
        //console.log(playlistVideos);
      } catch (err) {
        console.error('Error fetching videos: ', err);
      }
    };
    getYoutubeVideos();
  }, [instruments, playlists]);

  if (selectedPlaylist) {
    return <VideoPlayer
            playlist={selectedPlaylist.videos}
            videos={playlistVideos}
            selectedVideo={selectedVideo}
            onBack={() => setSelectedPlaylist(null)} 
            />;
  }

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

  return (
    <Box>
      <Heading size="md" mb={4}>
        Lesson Videos
      </Heading>
      {playlists.length === 0 && (
        <Text color="gray.500">No lesson videos available</Text>
      )}
      {playlistVideos.map((playlist) => {
        return (
          <>
            <HStack>
              <FiFolder></FiFolder>
              <Text>{playlist.instrumentName}</Text>
            </HStack>
            <HStack>
              <IconButton icon={<ChevronLeftIcon />} size="xs" flexShrink={0} />
              {playlist.videos.map((video, index) => {
                const embedUrl = getYouTubeEmbedUrl(video);
                if (!embedUrl) return null;
                return (
                  <Box 
                    key={`${playlist.programId}-${video.link}-${index}`}
                    borderWidth="1px"
                    borderRadius="md"
                    overflow="hidden"
                    w="md"
                    onClick={() => {setSelectedVideo(video); setSelectedPlaylist(playlist);}}
                  >
                    <AspectRatio ratio={16 / 9} w="100%">
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
              <IconButton icon={<ChevronRightIcon />} size="xs" />
            </HStack>
          </>
        );
      })}
    </Box>
  );
}

export default LessonVideos;
