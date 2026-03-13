import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  AspectRatio,
  Heading,
  Image,
  Divider,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  IconButton,
} from '@chakra-ui/icons';
import { useState } from 'react';

import { getYouTubeEmbedUrl } from '@/utils/youtube';

function VideoPlayer({
  playlist,
  videos,
  selectedVideo,
  onBack,
  setSelectedVideo,
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <HStack align="flex-start" spacing={0} w="100%">
      <VStack flex={1} align="flex-start" mr={8}>
        <Button
          leftIcon={<ArrowBackIcon />}
          size="lg"
          variant="ghost"
          my={4}
          color="white"
          _hover={{ bg: 'teal.600' }}
          bg="teal.500"
          onClick={onBack}
        >
          Back
        </Button>
        <Box borderRadius="3xl" overflow="hidden" w="100%">
          <AspectRatio ratio={16 / 9} w="100%" borderRadius="3xl" overflow="hidden">
            <iframe src={getYouTubeEmbedUrl(selectedVideo)} allowFullScreen/>
          </AspectRatio>
          <Heading>{selectedVideo.snippet.title}</Heading>
        </Box>
      </VStack>

      {!isOpen && (
        <IconButton
          icon={<ArrowLeftIcon />}
          onClick={() => setIsOpen(true)}
          alignSelf="flex-start"
          mt={4}
          bg="None"
          size="lg"
        />
      )}

      {isOpen && (
          <Box w="350px" bg="gray.100" alignSelf="stretch" mr={-12} p={5} borderTopLeftRadius="xl" h="100vh" overflowY="auto">          
          <IconButton
            icon={<ArrowRightIcon />}
            size="lg"
            onClick={() => setIsOpen(false)}

          />
          <VStack overflowY="auto" w="100%">
            <Heading>Playlist</Heading>
            <Divider my={3} borderColor="gray.600"/>
            {playlist.map((video) => {
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
                  key={video.snippet.resourceId.videoId}
                  w="100%"
                  bg={video === selectedVideo ? 'gray.300' : ''}
                  cursor="pointer"
                  borderRadius="2xl"
                  overflow="hidden"
                  onClick={() => setSelectedVideo(video)}
                >
                  <AspectRatio ratio={16 / 9} borderRadius="2xl">
                    <Image src={thumbnail} />
                  </AspectRatio>
                  <Box p={4}>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                      {snippet.title}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </VStack>
        </Box>
      )}
    </HStack>
  );
}

export default VideoPlayer;
