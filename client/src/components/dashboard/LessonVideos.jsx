import React, { useEffect, useState } from 'react';

import {
  AspectRatio,
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  Flex,
  IconButton,
  Image,
} from '@chakra-ui/react';
import { FiFolder, FiPlay } from 'react-icons/fi';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';

import VideoPlayer from './VideoPlayer';
import { getYouTubeEmbedUrl } from '@/utils/youtube';

function LessonVideos({
  selectedPlaylist,
  setSelectedPlaylist,
  selectedVideo,
  setSelectedVideo,
}) {
  const { currentUser } = useAuthContext();
  const userId = currentUser.uid;

  const { backend } = useBackendContext();
  const [playlists, setPlaylists] = useState([]);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [instruments, setInstruments] = useState({});
  const [playlistsIndex, setPlaylistIndex] = useState({});
  const videoCount = 3;

  const handleNext = (instrumentName) => {
    setPlaylistIndex((prev) => ({
      ...prev,
      [instrumentName]: (prev[instrumentName] ?? 0) + 1,
    }));
  };

  const handlePrev = (instrumentName) => {
    setPlaylistIndex((prev) => ({
      ...prev,
      [instrumentName]: (prev[instrumentName] ?? 0) - 1,
    }));
  };

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
  }, [backend]);

  useEffect(() => {
    if (playlists.length === 0 || Object.keys(instruments).length === 0) return;
    const getYoutubeVideos = async () => {
      try {
        const results = await Promise.all(
          playlists.map(async (playlist) => {
            const url = new URL(playlist.link);
            const playlistId = url.searchParams.get('list');
            const res = await backend.get(`/playlistCache/${playlistId}`);
            return { items: res.data };
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

        setPlaylistVideos(videosArray);
      } catch (err) {
        console.error('Error fetching videos: ', err);
      }
    };
    getYoutubeVideos();
  }, [instruments, playlists]);

  if (selectedPlaylist) {
    return (
      <VideoPlayer
        playlist={selectedPlaylist.videos}
        videos={playlistVideos}
        selectedVideo={selectedVideo}
        onBack={() => setSelectedPlaylist(null)}
        setSelectedVideo={setSelectedVideo}
      />
    );
  }

  return (
    <Box>
      <Heading size="lg" fontWeight="extrabold" mb={4}>
        Lesson Videos
      </Heading>
      {playlists.length === 0 && (
        <Text color="gray.500">No lesson videos available</Text>
      )}
      {playlistVideos.map((playlist, i) => {
        const startIndex = playlistsIndex[playlist.instrumentName] ?? 0;
        const videosShown = playlist.videos.slice(
          startIndex,
          startIndex + videoCount
        );
        return (
          <Box key={`${playlist.instrumentName}-${i}`} m={5}>
            <HStack
              bg="gray.100"
              w="fit-content"
              px={5}
              py={2}
              borderTopRadius="md"
              ml={20}
            >
              <FiFolder></FiFolder>
              <Text fontWeight="extrabold" fontSize="xl">
                {playlist.instrumentName}
              </Text>
            </HStack>
            <Flex align="center">
              <IconButton
                icon={<ChevronLeftIcon boxSize={20} />}
                variant="ghost"
                size="xl"
                color="gray.400"
                flexShrink={0}
                isDisabled={startIndex === 0}
                onClick={() => handlePrev(playlist.instrumentName)}
              />
              <HStack
                overflowX="auto"
                bg="gray.100"
                w="fit-content"
                borderBottomRadius="xl"
                borderTopRightRadius="xl"
              >
                {videosShown.map((video, index) => {
                  const snippet = video.snippet;
                  const thumbnail =
                    snippet?.thumbnails?.maxres?.url ??
                    snippet?.thumbnails?.high?.url ??
                    snippet?.thumbnails?.medium?.url ??
                    snippet?.thumbnails?.default?.url ??
                    `https://img.youtube.com/vi/${snippet.resourceId.videoId}/hqdefault.jpg`;
                  const embedUrl = getYouTubeEmbedUrl(video);
                  if (!embedUrl) return null;
                  return (
                    <Box
                      key={`${playlist.programId}-${video.link}-${index}`}
                      borderRadius="md"
                      p={5}
                      overflow="hidden"
                      flexShrink={0}
                      w="md"
                      cursor="pointer"
                      onClick={() => {
                        setSelectedVideo(video);
                        setSelectedPlaylist(playlist);
                      }}
                    >
                      <Box position="relative" borderRadius="2xl" overflow="hidden">
                        <AspectRatio ratio={16 / 9} w="100%">
                          <Image src={thumbnail} />
                        </AspectRatio>
                        <Box
                          position="absolute"
                          bottom="0"
                          left="0"
                          w="100%"
                          bg="blackAlpha.700"
                          p={2}
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="white"
                            noOfLines={2}
                          >
                            {snippet.title}
                          </Text>
                        </Box>
                        <Flex
                          position="absolute"
                          top="0"
                          left="0"
                          w="100%"
                          h="100%"
                          align="center"
                          justify="center"
                          bg="blackAlpha.300"
                        >
                          <FiPlay fill="white" color="white" size={40} />
                        </Flex>
                      </Box>
                    </Box>
                  );
                })}
              </HStack>
              <IconButton
                icon={<ChevronRightIcon boxSize={20} />}
                variant="ghost"
                size="xl"
                color="gray.400"
                isDisabled={startIndex + videoCount >= playlist.videos.length}
                onClick={() => handleNext(playlist.instrumentName)}
              />
            </Flex>
          </Box>
        );
      })}
    </Box>
  );
}

export default LessonVideos;
