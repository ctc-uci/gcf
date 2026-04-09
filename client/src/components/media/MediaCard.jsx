import { useState } from 'react';

import { Box, Center, Image, Text } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import gcf_globe from '/gcf_globe.png';

export const MediaCard = ({
  file_name,
  file_type,
  imageUrl,
  description,
  height = '200px',
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const isVideo = file_type?.startsWith('video');

  return (
    <Box
      borderRadius="md"
      overflow="hidden"
      bg="gray.100"
    >
      <Box
        h={height}
        position="relative"
      >
        {isLoading && (
          <Center h="100%">
            <Image
              src={gcf_globe}
              w="50px"
            />
          </Center>
        )}
        {isVideo ? (
          <video
            src={imageUrl}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onLoadedData={() => setIsLoading(false)}
          />
        ) : (
          <Image
            src={imageUrl}
            h="100%"
            w="100%"
            objectFit="contain"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </Box>

      <Text
        color="gray.700"
        fontSize="sm"
        mt={2}
        px={2}
        isTruncated
      >
        {file_name || 'TEXT'}
      </Text>
      <Text
        color="gray.500"
        fontSize="xs"
        mt={1}
        px={2}
        isTruncated
      >
        {description || 'No description available'}
      </Text>
    </Box>
  );
};
