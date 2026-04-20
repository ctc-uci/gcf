import { useState } from 'react';

import {
  Box,
  Center,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { FiPlay } from 'react-icons/fi';

const mediaFileType = (m) => m?.file_type ?? m?.fileType ?? '';

const isVideoMedia = (m) => mediaFileType(m).startsWith('video');

const isPdfMedia = (m) => mediaFileType(m) === 'application/pdf';

const mediaDisplayName = (m) => m?.fileName ?? m?.file_name ?? '';

export const ProgramMediaGallery = ({ media, mediaUrls }) => {
  const { t } = useTranslation();
  const {
    isOpen: isGalleryPreviewOpen,
    onOpen: onGalleryPreviewOpen,
    onClose: onGalleryPreviewClose,
  } = useDisclosure();
  const [galleryPreviewItem, setGalleryPreviewItem] = useState(null);

  const openGalleryPreview = (item) => {
    setGalleryPreviewItem(item);
    onGalleryPreviewOpen();
  };

  const closeGalleryPreview = () => {
    setGalleryPreviewItem(null);
    onGalleryPreviewClose();
  };

  const galleryPreviewUrl = galleryPreviewItem
    ? mediaUrls[galleryPreviewItem.id]
    : null;

  const galleryPreviewDescription =
    typeof galleryPreviewItem?.description === 'string' &&
    galleryPreviewItem.description.trim() !== ''
      ? galleryPreviewItem.description.trim()
      : null;

  if (!media.length) {
    return null;
  }

  return (
    <>
      <VStack
        align="flex-start"
        spacing="24px"
        w="100%"
        py="24px"
      >
        <Heading
          fontWeight="600"
          fontSize="28px"
          lineHeight="44px"
          color="#000000"
        >
          Gallery
        </Heading>
        <HStack
          spacing="16px"
          overflowX="auto"
          w="100%"
          css={{
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {media.map((m) =>
            mediaUrls[m.id] ? (
              <Box
                key={m.id}
                position="relative"
                w="300px"
                h="300px"
                flexShrink={0}
                borderRadius="12px"
                overflow="hidden"
                filter="drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))"
                role="button"
                tabIndex={0}
                cursor="pointer"
                onClick={() => openGalleryPreview(m)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openGalleryPreview(m);
                  }
                }}
                aria-label={t('mediaPreviewTag.openPreview')}
                _hover={{
                  '& .gallery-card-overlay': { opacity: 1 },
                }}
              >
                {isVideoMedia(m) ? (
                  <>
                    <video
                      src={mediaUrls[m.id]}
                      muted
                      playsInline
                      loop
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <Center
                      position="absolute"
                      inset={0}
                      pointerEvents="none"
                    >
                      <Box
                        bg="blackAlpha.600"
                        borderRadius="full"
                        p={3}
                      >
                        <Icon
                          as={FiPlay}
                          color="white"
                          boxSize={6}
                        />
                      </Box>
                    </Center>
                  </>
                ) : isPdfMedia(m) ? (
                  <iframe
                    src={mediaUrls[m.id]}
                    title={mediaDisplayName(m)}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <Image
                    src={mediaUrls[m.id]}
                    alt={mediaDisplayName(m)}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                )}
                <Flex
                  className="gallery-card-overlay"
                  position="absolute"
                  top={0}
                  left={0}
                  w="100%"
                  h="100%"
                  zIndex={2}
                  bg="blackAlpha.600"
                  opacity={0}
                  transition="opacity 0.3s"
                  direction="column"
                  justify="flex-end"
                  p="16px"
                >
                  <Text
                    color="white"
                    fontWeight="700"
                    fontSize="16px"
                    lineHeight="20px"
                  >
                    {mediaDisplayName(m)}
                  </Text>
                  {m.description && (
                    <Text
                      color="whiteAlpha.800"
                      fontSize="13px"
                      lineHeight="18px"
                      mt="4px"
                    >
                      {m.description}
                    </Text>
                  )}
                </Flex>
              </Box>
            ) : null
          )}
        </HStack>
      </VStack>

      <Modal
        isOpen={isGalleryPreviewOpen}
        onClose={closeGalleryPreview}
        size={
          galleryPreviewItem && isPdfMedia(galleryPreviewItem) ? '6xl' : '4xl'
        }
        isCentered
        portalProps={{ zIndex: 2000 }}
      >
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent maxH="90vh">
          <ModalCloseButton />
          <ModalBody
            p={4}
            pt={10}
          >
            <Text
              fontWeight="semibold"
              mb={3}
              noOfLines={2}
            >
              {galleryPreviewItem ? mediaDisplayName(galleryPreviewItem) : ''}
            </Text>
            <Box
              borderRadius="md"
              overflow="hidden"
              bg="gray.900"
              minH={
                galleryPreviewItem && isPdfMedia(galleryPreviewItem)
                  ? '75vh'
                  : 'auto'
              }
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {galleryPreviewUrl &&
              galleryPreviewItem &&
              isVideoMedia(galleryPreviewItem) ? (
                <video
                  src={galleryPreviewUrl}
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '75vh',
                    width: '100%',
                  }}
                />
              ) : galleryPreviewUrl &&
                galleryPreviewItem &&
                isPdfMedia(galleryPreviewItem) ? (
                <iframe
                  src={galleryPreviewUrl}
                  title={mediaDisplayName(galleryPreviewItem)}
                  style={{
                    width: '100%',
                    height: '75vh',
                    border: 'none',
                  }}
                />
              ) : galleryPreviewUrl && galleryPreviewItem ? (
                <Image
                  src={galleryPreviewUrl}
                  alt={mediaDisplayName(galleryPreviewItem)}
                  maxH="75vh"
                  maxW="100%"
                  objectFit="contain"
                />
              ) : null}
            </Box>
            <Text
              fontSize="sm"
              color="gray.500"
              mt={4}
              whiteSpace="pre-wrap"
            >
              {galleryPreviewDescription ?? t('mediaCard.noDescription')}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
