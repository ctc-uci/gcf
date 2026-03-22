import React, { useEffect, useRef, useState } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  AspectRatio,
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Skeleton,
  Spinner,
  Text,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { getYouTubeEmbedUrl } from '@/utils/youtube';
import { FiFolder, FiPlay } from 'react-icons/fi';

import VideoPlayer from './VideoPlayer';

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
  const [isLoading, setIsLoading] = useState(true);
  const scrollRefs = useRef({});

  const SCROLL_AMOUNT = 3 * (320 + 20); // 3 videos (width + gap)

  const handleNext = (instrumentName) => {
    const el = scrollRefs.current[instrumentName];
    if (el) el.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
  };

  const handlePrev = (instrumentName) => {
    const el = scrollRefs.current[instrumentName];
    if (el) el.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const loadAll = async () => {
      try {
        const [playlistRes, instrumentsRes] = await Promise.all([
          backend.get(`/program-directors/me/${userId}/playlist`),
          backend.get('/instruments'),
        ]);
        if (cancelled) return;

        const playlistList = Array.isArray(playlistRes.data)
          ? playlistRes.data
          : [];
        const instrumentsData = instrumentsRes.data ?? [];

        const instrumentMap = {};
        instrumentsData.forEach((instrument) => {
          instrumentMap[instrument.id] = instrument.name;
        });

        setPlaylists(playlistList);

        if (playlistList.length === 0) return;

        const results = await Promise.all(
          playlistList.map(async (playlist) => {
            const url = new URL(playlist.link);
            const playlistId = url.searchParams.get('list');
            const res = await backend.get(`/playlistCache/${playlistId}`);
            return { items: res.data };
          })
        );
        if (cancelled) return;

        const videos = {};
        playlistList.forEach((playlist, index) => {
          const instrumentName = instrumentMap[playlist.instrumentId];
          if (!videos[instrumentName]) {
            videos[instrumentName] = [];
          }
          videos[instrumentName].push(...(results[index]?.items ?? []));
        });
        const videosArray = Object.entries(videos).map(
          ([instrumentName, videos]) => ({
            instrumentName,
            videos,
          })
        );

        setPlaylistVideos(videosArray);
      } catch (err) {
        if (!cancelled) console.error('Error fetching lesson data:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [userId, backend]);

  if (selectedPlaylist) {
    return (
      <VideoPlayer
        playlist={selectedPlaylist.videos}
        playlistName={selectedPlaylist.instrumentName}
        videos={playlistVideos}
        selectedVideo={selectedVideo}
        onBack={() => setSelectedPlaylist(null)}
        setSelectedVideo={setSelectedVideo}
      />
    );
  }

  return (
    <Box>
      <Heading
        size="lg"
        fontWeight="extrabold"
        mb={4}
      >
        Lesson Videos
      </Heading>
      {!isLoading && playlists.length === 0 && (
        <Text color="gray.500">No lesson videos available</Text>
      )}
      {isLoading && (
        <Box m={5}>
          <Flex
            align="center"
            gap={3}
            mb={4}
          >
            <Spinner
              size="sm"
              color="blue.500"
            />
            <Text
              color="gray.600"
              fontSize="sm"
            >
              Loading lesson videos...
            </Text>
          </Flex>
          <HStack
            spacing={5}
            overflow="hidden"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                borderRadius="xl"
                flexShrink={0}
                w="320px"
                h="180px"
                startColor="gray.100"
                endColor="gray.200"
              />
            ))}
          </HStack>
        </Box>
      )}
      {!isLoading &&
        playlistVideos.map((playlist, i) => (
          <Box
            key={`${playlist.instrumentName}-${i}`}
            m={5}
          >
            <HStack
              bg="gray.100"
              w="fit-content"
              px={5}
              py={2}
              borderTopRadius="md"
            >
              <FiFolder />
              <Text
                fontWeight="bold"
                fontSize="lg"
              >
                {playlist.instrumentName}
              </Text>
            </HStack>
            <Box
              position="relative"
              w="fit-content"
            >
              <IconButton
                position="absolute"
                left="-70px"
                top="50%"
                transform="translateY(-50%)"
                zIndex={1}
                icon={<ChevronLeftIcon boxSize={16} />}
                variant="ghost"
                size="lg"
                color="gray.400"
                onClick={() => handlePrev(playlist.instrumentName)}
                aria-label="Scroll left"
              />
              <Box
                ref={(el) => {
                  scrollRefs.current[playlist.instrumentName] = el;
                }}
                overflowX="auto"
                overflowY="hidden"
                bg="gray.100"
                w="fit-content"
                maxW="1040px"
                borderBottomRadius="xl"
                borderTopRightRadius="xl"
                p={5}
                sx={{ '&::-webkit-scrollbar': { height: '8px' } }}
              >
                <HStack
                  spacing={5}
                  w="max-content"
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
                        <Box
                          position="relative"
                          borderRadius="2xl"
                          overflow="hidden"
                        >
                          <AspectRatio
                            ratio={16 / 9}
                            w="100%"
                          >
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
                            <FiPlay
                              fill="white"
                              color="white"
                              size={28}
                            />
                          </Flex>
                        </Box>
                      </Box>
                    );
                  })}
                </HStack>
              </Box>
              <IconButton
                position="absolute"
                right="-70px"
                top="50%"
                transform="translateY(-50%)"
                zIndex={1}
                icon={<ChevronRightIcon boxSize={16} />}
                variant="ghost"
                size="lg"
                color="gray.400"
                onClick={() => handleNext(playlist.instrumentName)}
                aria-label="Scroll right"
              />
            </Box>
          </Box>
        ))}
    </Box>
  );
}

export default LessonVideos;
