import { useState } from 'react';

import { Box, Center, Image } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import gcf_globe from '/gcf_globe.png';

export const MediaCard = ({
  file_name,
  file_type,
  imageUrl,
  height = '200px',
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const isVideo = file_type?.startsWith('video');
  const isPdf = file_type === 'application/pdf';

  return (
    <Box
      h={height}
      borderRadius="md"
      overflow="hidden"
    >
      {isLoading && (
        <Center h="100%">
          <Image
            src={gcf_globe}
            alt={t('mediaCard.loadingAlt')}
            w="50px"
          />
        </Center>
      )}
      {isVideo ? (
        <video
          src={imageUrl}
          controls
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: isLoading ? 'none' : 'block',
            borderRadius: '6px',
          }}
          onLoadedData={() => setIsLoading(false)}
        />
      ) : isPdf ? (
        <iframe
          src={imageUrl}
          title={file_name}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: isLoading ? 'none' : 'block',
            borderRadius: '6px',
          }}
          onLoad={() => setIsLoading(false)}
        />
      ) : (
        <Image
          src={imageUrl}
          alt={file_name}
          w="100%"
          h="100%"
          objectFit="contain"
          display={isLoading ? 'none' : 'block'}
          borderRadius="md"
          onLoad={() => setIsLoading(false)}
        />
      )}
    </Box>
  );
};