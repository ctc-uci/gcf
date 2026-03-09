import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  AspectRatio,
  Heading,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  IconButton,
} from '@chakra-ui/icons';
import { useState } from 'react';

import { getYouTubeEmbedUrl } from '@/utils/youtube';

function VideoPlayer({ playlist, videos, selectedVideo, onBack }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <HStack justify="space-between" align="center">
        <Button leftIcon={<ArrowBackIcon />} variant="ghost" onClick={onBack}>
          Back
        </Button>
        {!isOpen && (
          <IconButton
            icon={<ChevronLeftIcon />}
            onClick={() => setIsOpen(!isOpen)}
          />
        )}
      </HStack>
      <HStack align="flex-start">
        <VStack flex={isOpen ? 0.8 : 1} align="flex-start">
          <AspectRatio ratio={16 / 9} w="100%">
            <iframe src={getYouTubeEmbedUrl(selectedVideo)} allowFullScreen />
          </AspectRatio>
          <Heading>{selectedVideo.snippet.title}</Heading>
        </VStack>
        {isOpen && (
          <Box flex={isOpen ? 0.2 : 0}>
            <IconButton
              icon={<ChevronRightIcon />}
              onClick={() => setIsOpen(!isOpen)}
            />
            <VStack overflowY="auto" maxH="100vh">
              <Heading>Playlist</Heading>
              {playlist.map((video, index) => {
                const embedUrl = getYouTubeEmbedUrl(video);
                if (!embedUrl) return null;
                return (
                  <>
                    <Box
                      key={`${playlist.programId}-${video.link}-${index}`}
                      w="xs"
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
                  </>
                );
              })}
            </VStack>
          </Box>
        )}
      </HStack>
    </>
  );
}

export default VideoPlayer;
