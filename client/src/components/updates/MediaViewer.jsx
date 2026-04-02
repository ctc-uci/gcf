import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  CloseButton,
  Flex,
  IconButton,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { MediaCard } from '@/components/media/MediaCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

export const MediaViewer = ({ updates, mediaURLs, selectedIndex, onClose }) => {
  const [current, setCurrent] = useState(selectedIndex);

  useEffect(() => {
    setCurrent(selectedIndex);
  }, [selectedIndex]);

  const goNext = useCallback(() => setCurrent((prev) => (prev + 1) % updates.length), [updates.length]);
  const goPrev = useCallback(() => setCurrent((prev) => (prev - 1 + updates.length) % updates.length), [updates.length]);

  const item = updates[current];
  const url = mediaURLs[current];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
}, [goNext, goPrev, onClose]);

  return (
    <Modal isOpen={true} onClose={onClose} isCentered size="3xl">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent
        bg="white"
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="2xl"
        maxW="680px"
        mx={4}
      >
        {/* Header */}
        <Flex
          px={5}
          py={4}
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Text fontWeight="700" fontSize="lg" color="gray.800">
            Map Settings
          </Text>
          <CloseButton onClick={onClose} size="md" color="gray.500" />
        </Flex>

        {/* Main media display */}
        <Box position="relative" bg="gray.900" px={4} py={3}>
          <MediaCard
            file_name={item?.fileName}
            file_type={item?.fileType}
            imageUrl={url}
          />

          {/* Prev / Next arrows */}
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

        {/* Media info (defaults to hardcoded values) */}
        <Box px={5} pt={4} pb={2}>
          <Text fontWeight="700" fontSize="md" color="gray.800">
            {item?.fileName ?? 'Media Title'}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={0.5}>
            {item?.description ?? 'Video Description'}
          </Text>
        </Box>

        {/* Thumbnail strip */}
        {updates.length > 1 && (
          <Flex
            px={5}
            pb={5}
            pt={2}
            gap={3}
            overflowX="auto"
            css={{
              '&::-webkit-scrollbar': { height: '4px' },
              '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '4px' },
            }}
          >
            {updates.map((thumb, i) => (
              <Box
                key={thumb.id}
                flexShrink={0}
                cursor="pointer"
                onClick={() => setCurrent(i)}
                borderRadius="md"
                overflow="hidden"
                border="2px solid"
                borderColor={i === current ? 'teal.400' : 'transparent'}
                transition="border-color 0.15s"
                position="relative"
                w="90px"
                h="64px"
              >
                <Image
                  src={mediaURLs[i]}
                  alt={thumb.fileName}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  opacity={i === current ? 1 : 0.7}
                  transition="opacity 0.15s"
                  _hover={{ opacity: 1 }}
                />
                <Text
                  position="absolute"
                  bottom={1}
                  left={1}
                  right={1}
                  fontSize="9px"
                  fontWeight="600"
                  color="white"
                  noOfLines={1}
                  textShadow="0 1px 3px rgba(0,0,0,0.8)"
                >
                  {thumb.fileName ?? 'Media Title'}
                </Text>
              </Box>
            ))}
          </Flex>
        )}
      </ModalContent>
    </Modal>
  );
};