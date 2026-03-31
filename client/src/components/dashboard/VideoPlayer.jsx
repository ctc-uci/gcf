import { useState } from 'react';

import {
  ArrowBackIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  IconButton,
} from '@chakra-ui/icons';
import {
  AspectRatio,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';

import { getYouTubeEmbedUrl } from '@/utils/youtube';
import { useTranslation } from 'react-i18next';

function VideoPlayer({
  playlist,
  playlistName: playlistNameProp,
  videos,
  selectedVideo,
  onBack,
  setSelectedVideo,
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <HStack
      align="flex-start"
      spacing={0}
      w="100%"
    >
      <VStack
        flex={1}
        align="flex-start"
        mr={8}
      >
        <Button
          leftIcon={<ArrowBackIcon />}
          size="md"
          variant="ghost"
          mb={4}
          color="white"
          _hover={{ bg: 'teal.600' }}
          bg="teal.500"
          onClick={onBack}
        >
          {t('common.back')}
        </Button>
        <Box
          overflow="hidden"
          w="100%"
        >
          <AspectRatio
            ratio={16 / 9}
            w="100%"
            borderRadius="3xl"
            overflow="hidden"
          >
            <iframe
              src={getYouTubeEmbedUrl(selectedVideo)}
              allowFullScreen
            />
          </AspectRatio>
          <Heading
            size="md"
            pt={5}
          >
            {selectedVideo.snippet.title}
          </Heading>
        </Box>
      </VStack>

      {!isOpen && (
        <IconButton
          icon={<ArrowLeftIcon />}
          onClick={() => setIsOpen(true)}
          alignSelf="flex-start"
          mb={4}
          bg="None"
          size="md"
        />
      )}

      {isOpen && (
        <Box
          w="350px"
          bg="gray.100"
          alignSelf="stretch"
          mr={-12}
          p={5}
          borderTopLeftRadius="xl"
          h="100vh"
          overflowY="auto"
        >
          <IconButton
            icon={<ArrowRightIcon />}
            size="md"
            onClick={() => setIsOpen(false)}
          />
          <VStack
            overflowY="auto"
            w="100%"
            spacing={3}
          >
            <Heading size="md">{playlistName}</Heading>
            <Divider
              my={3}
              borderColor="gray.600"
            />
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
                  borderRadius="lg"
                  overflow="hidden"
                  onClick={() => setSelectedVideo(video)}
                >
                  <AspectRatio
                    ratio={16 / 9}
                    borderRadius="2xl"
                  >
                    <Image src={thumbnail} />
                  </AspectRatio>
                  <Box p={3}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      noOfLines={2}
                    >
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
