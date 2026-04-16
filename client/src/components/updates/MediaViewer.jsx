import { useCallback, useEffect, useState } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  CloseButton,
  Flex,
  HStack,
  IconButton,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  Spacer,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import { MediaEditModal } from '@/components/media/MediaEditModal';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';
import { BsFillPencilFill } from 'react-icons/bs';

import gcf_globe from '/gcf_globe.png';

export const MediaViewer = ({
  updates,
  mediaURLs,
  selectedIndex,
  onClose,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const [current, setCurrent] = useState(selectedIndex);
  const [isLoading, setIsLoading] = useState(true);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    setCurrent(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    setIsLoading(true);
  }, [current]);

  const goNext = useCallback(
    () => setCurrent((prev) => (prev + 1) % updates.length),
    [updates.length]
  );
  const goPrev = useCallback(
    () => setCurrent((prev) => (prev - 1 + updates.length) % updates.length),
    [updates.length]
  );
  const item = updates[current];
  const url = mediaURLs[current];
  const isVideo = item?.fileType?.startsWith('video');

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  const openEdit = () => {
    setEditingItem(item);
    onEditOpen();
  };

  const closeEdit = () => {
    setEditingItem(null);
    onEditClose();
  };

  const handleEditSave = async (newTitle, newDescription) => {
    const mediaId = editingItem?.id;
    if (!mediaId) return;
    try {
      await backend.put(`/mediaChange/${mediaId}`, {
        file_name: newTitle,
        description: newDescription,
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      isCentered
      size="3xl"
    >
      <ModalOverlay
        bg="blackAlpha.700"
        backdropFilter="blur(4px)"
      />
      <ModalContent
        bg="white"
        borderRadius="2xl"
        overflow="auto"
        boxShadow="2xl"
        maxW="900px"
        maxH="90vh"
        mx={4}
      >
        <Flex
          px={5}
          py={4}
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Text
            fontWeight="700"
            fontSize="lg"
            color="gray.800"
          >
            Media Viewer
          </Text>
          <CloseButton
            onClick={onClose}
            size="md"
            color="gray.500"
          />
        </Flex>

        <Box
          position="relative"
          bg="gray.900"
          px={4}
          py={3}
        >
          <Box
            h={{ base: '38vh', md: '56vh' }}
            borderRadius="xl"
            overflow="hidden"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {isLoading && (
              <Image
                src={gcf_globe}
                w="50px"
                position="absolute"
              />
            )}
            {isVideo ? (
              <video
                src={url}
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: isLoading ? 'none' : 'block',
                }}
                onLoadedData={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            ) : (
              <Image
                src={url}
                alt={item?.fileName}
                maxH="100%"
                maxW="100%"
                objectFit="contain"
                display={isLoading ? 'none' : 'block'}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            )}
          </Box>

          {updates.length > 1 && (
            <>
              <IconButton
                icon={<ChevronLeftIcon boxSize={6} />}
                aria-label="Previous"
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
                onClick={goPrev}
                bg="blackAlpha.500"
                color="white"
                _hover={{ bg: 'blackAlpha.700' }}
                borderRadius="full"
                size="sm"
              />
              <IconButton
                icon={<ChevronRightIcon boxSize={6} />}
                aria-label="Next"
                position="absolute"
                right={3}
                top="50%"
                transform="translateY(-50%)"
                onClick={goNext}
                bg="blackAlpha.500"
                color="white"
                _hover={{ bg: 'blackAlpha.700' }}
                borderRadius="full"
                size="sm"
              />
            </>
          )}
        </Box>

        <Box
          px={5}
          pt={4}
          pb={5}
        >
          <HStack
            w="full"
            align="center"
          >
            <Text
              fontWeight="700"
              fontSize="md"
              color="gray.800"
            >
              {item?.fileName ?? 'Media Title'}
            </Text>
            <Spacer />
            {onUpdate && (
              <IconButton
                icon={<BsFillPencilFill />}
                aria-label={t('mediaEditModal.heading')}
                size="sm"
                variant="ghost"
                onClick={openEdit}
              />
            )}
          </HStack>
          <Text
            fontSize="sm"
            color="gray.500"
            mt={0.5}
          >
            {item?.description || t('mediaCard.noDescription')}
          </Text>
        </Box>
      </ModalContent>

      <MediaEditModal
        isOpen={isEditOpen}
        onClose={closeEdit}
        onSave={handleEditSave}
        initialTitle={editingItem?.fileName || ''}
        initialDescription={editingItem?.description || ''}
      />
    </Modal>
  );
};
