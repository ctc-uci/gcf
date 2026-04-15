import { useState } from 'react';
import { Box, Center, Image, IconButton, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody } from '@chakra-ui/react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const isVideo = file_type?.startsWith('video');
  const isPdf = file_type === 'application/pdf';

  return (
    <>
      <Box
        h={height}
        borderRadius="md"
        overflow="hidden"
        position="relative"
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
          <>
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
            {!isLoading && (
              <IconButton
                aria-label={t('mediaCard.expandPdf')}
                icon={<span style={{ fontSize: '16px' }}>⛶</span>}
                size="sm"
                position="absolute"
                top={2}
                right={2}
                onClick={() => setIsExpanded(true)}
                zIndex={1}
              />
            )}
          </>
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

      {isPdf && (
        <Modal isOpen={isExpanded} onClose={() => setIsExpanded(false)} size="6xl">
          <ModalOverlay />
          <ModalContent h="90vh">
            <ModalCloseButton zIndex={1} />
            <ModalBody p={0}>
              <iframe
                src={imageUrl}
                title={file_name}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '6px',
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};