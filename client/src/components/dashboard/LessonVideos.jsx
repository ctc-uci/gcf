import React, { useEffect, useRef, useState } from 'react';

import {
  AspectRatio,
  Box,
  Heading,
  HStack,
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
  const [scrollState, setScrollState] = useState({});
  const scrollRefs = useRef({});

  const CARD_WIDTH = 320;
  const CARD_GAP = 20;
  const SCROLL_AMOUNT = 3 * (CARD_WIDTH + CARD_GAP);

  const updateScrollState = (instrumentName, el) => {
    if (!el) return;
    setScrollState((prev) => ({
      ...prev,
      [instrumentName]: {
        scrollLeft: el.scrollLeft,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      },
    }));
  };

  const handleNext = (instrumentName) => {
    const el = scrollRefs.current[instrumentName];
    if (el) el.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
  };

  const handlePrev = (instrumentName) => {
    const el = scrollRefs.current[instrumentName];
    if (el) el.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
  };

  const canScrollLeft = (instrumentName) =>
    (scrollState[instrumentName]?.scrollLeft ?? 0) > 0;
  const canScrollRight = (instrumentName) => {
    const s = scrollState[instrumentName];
    if (!s) return true;
    return s.scrollLeft < s.scrollWidth - s.clientWidth - 1;
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
      {playlistVideos.map((playlist, i) => (
        <Box key={`${playlist.instrumentName}-${i}`} m={5}>
          <HStack
            bg="gray.100"
            w="fit-content"
            px={5}
            py={2}
            borderTopRadius="md"
          >
            <FiFolder />
            <Text fontWeight="bold" fontSize="lg">
              {playlist.instrumentName}
            </Text>
          </HStack>
          <HStack
            overflowX="auto"
            overflowY="hidden"
            bg="gray.100"
            w="fit-content"
            maxW="1040px"
            borderBottomRadius="xl"
            borderTopRightRadius="xl"
            p={5}
            spacing={5}
            sx={{ '&::-webkit-scrollbar': { height: '8px' } }}
          >
            {playlist.videos.map((video, index) => {
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
                  key={`${playlist.instrumentName}-${video.snippet?.resourceId?.videoId ?? index}-${index}`}
                  borderRadius="md"
                  overflow="hidden"
                  flexShrink={0}
                  w="320px"
                  maxW="320px"
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
                      p={1.5}
                    >
                      <Text
                        fontSize="xs"
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
                      <FiPlay fill="white" color="white" size={28} />
                    </Flex>
                  </Box>
                </Box>
              );
            })}
          </HStack>
        </Box>
      ))}
    </Box>
  );
}

export default LessonVideos;
