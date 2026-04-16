import { useEffect, useState } from 'react';

import {
  Box,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

export function MediaPreviewTag({ item, onRemove, isMedia }) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { backend } = useBackendContext();
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();

  useEffect(() => {
    const fetchUrl = async () => {
      if (!item.s3_key) return;

      try {
        const res = await backend.get(
          `/images/url/${encodeURIComponent(item.s3_key)}`
        );
        if (res.data && res.data.success) {
          setPreviewUrl(res.data.url);
        }
      } catch (error) {
        console.error('Failed to fetch image URL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [item.s3_key, backend]);

  const isPdf = item.file_type === 'application/pdf';

  if ((isMedia && isPdf) || (!isMedia && !isPdf)) {
    return null;
  }

  const isVideo = item.file_type?.startsWith('video/');

  const descriptionText =
    typeof item.description === 'string' && item.description.trim() !== ''
      ? item.description.trim()
      : null;

  const canOpenPreview = Boolean(previewUrl) && !isLoading;

  function handleOpenPreview() {
    if (!canOpenPreview) return;
    onPreviewOpen();
  }

  function handleRemoveClick(e) {
    e.stopPropagation();
    onRemove();
  }

  return (
    <>
      <Tag
        maxW="250px"
        p={2}
        borderRadius="md"
        size="lg"
      >
        <Box
          w="2.5rem"
          h="2.5rem"
          mr={2}
          flexShrink={0}
          borderRadius="md"
          overflow="hidden"
          bg="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor={canOpenPreview ? 'pointer' : 'default'}
          onClick={handleOpenPreview}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenPreview();
            }
          }}
          role={canOpenPreview ? 'button' : undefined}
          tabIndex={canOpenPreview ? 0 : undefined}
          aria-label={
            canOpenPreview ? t('mediaPreviewTag.openPreview') : undefined
          }
        >
          {isLoading ? (
            <Spinner size="xs" />
          ) : isVideo ? (
            <video
              src={previewUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
              muted
              playsInline
            />
          ) : isMedia ? (
            <Image
              src={previewUrl}
              alt={item.file_name}
              boxSize="100%"
              objectFit="cover"
              pointerEvents="none"
            />
          ) : isPdf ? (
            <iframe
              src={previewUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                pointerEvents: 'none',
              }}
              title={item.file_name}
            />
          ) : null}
        </Box>

        <TagLabel
          isTruncated
          title={item.file_name}
          cursor={canOpenPreview ? 'pointer' : 'default'}
          onClick={handleOpenPreview}
        >
          {item.file_name}
        </TagLabel>
        <TagCloseButton onClick={handleRemoveClick} />
      </Tag>

      <Modal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        size={isPdf ? '6xl' : '4xl'}
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
              {item.file_name}
            </Text>
            <Box
              borderRadius="md"
              overflow="hidden"
              bg="gray.900"
              minH={isPdf ? '75vh' : 'auto'}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {isVideo ? (
                <video
                  src={previewUrl}
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '75vh',
                    width: '100%',
                  }}
                />
              ) : isPdf ? (
                <iframe
                  src={previewUrl}
                  title={item.file_name}
                  style={{
                    width: '100%',
                    height: '75vh',
                    border: 'none',
                  }}
                />
              ) : (
                <Image
                  src={previewUrl}
                  alt={item.file_name}
                  maxH="75vh"
                  maxW="100%"
                  objectFit="contain"
                />
              )}
            </Box>
            <Text
              fontSize="sm"
              color="gray.500"
              mt={4}
              whiteSpace="pre-wrap"
            >
              {descriptionText ?? t('mediaCard.noDescription')}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
