import { useState } from 'react';

import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  IconButton,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiDownload, FiMaximize2, FiMinimize2, FiUser } from 'react-icons/fi';

import { useBackendContext } from '../../../contexts/hooks/useBackendContext';

export const ReviewMediaUpdate = ({ update, onClose, onUpdate }) => {
  const { backend } = useBackendContext();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const updateId = update?.id;

  const handleKeepUnresolved = () => {
    onClose();
  };

  const handleMarkResolved = async () => {
    if (updateId == null) return;
    setIsLoading(true);
    try {
      await backend.put(`/mediaChange/${updateId}/approve`);
      onUpdate((prev) =>
        prev.map((row) =>
          row.id === updateId ? { ...row, status: 'Approved' } : row
        )
      );
      onClose();
    } catch (err) {
      console.error('Failed to resolve:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const mediaItems = update?.media || [];

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      placement="right"
      size={isFullScreen ? 'full' : 'lg'}
    >
      <DrawerOverlay />
      <DrawerContent maxW={isFullScreen ? '100%' : '50%'}>
        <Flex position="absolute" top={3} left={3} zIndex={1}>
          <IconButton
            icon={isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
            aria-label={isFullScreen ? 'Minimize' : 'Expand'}
            variant="ghost"
            size="sm"
            onClick={() => setIsFullScreen(!isFullScreen)}
          />
        </Flex>

        <Box pt={6} pb={2} px={8}>
          <Text fontSize="xl" fontWeight="600" textAlign="center">
            Media Update
          </Text>
          <Divider mt={3} />
        </Box>

        <DrawerBody px={8} pb={24}>
          <VStack spacing={6} align="stretch" mt={4}>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
              <GridItem>
                <Text color="teal.500" fontSize="sm" fontWeight="500" mb={1}>
                  Author
                </Text>
                <HStack spacing={1}>
                  <Icon as={FiUser} boxSize={4} color="gray.400" />
                  <Text>
                    {update?.firstName} {update?.lastName}
                  </Text>
                </HStack>
              </GridItem>
              <GridItem>
                <Text color="teal.500" fontSize="sm" fontWeight="500" mb={1}>
                  Program
                </Text>
                <Text>{update?.programName ?? ''}</Text>
              </GridItem>
              <GridItem>
                <Text color="teal.500" fontSize="sm" fontWeight="500" mb={1}>
                  Time
                </Text>
                <Text>{update?.updateDate ?? ''}</Text>
              </GridItem>
            </Grid>

            <Box>
              <Text color="teal.500" fontSize="sm" fontWeight="500" mb={2}>
                Note
              </Text>
              <Text>{update?.note || ''}</Text>
            </Box>

            <Box>
              <Text fontSize="lg" fontWeight="600" mb={3}>
                Media
              </Text>
              {mediaItems.length > 0 ? (
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                  {mediaItems.map((item, idx) => (
                    <Box key={idx}>
                      <Box
                        position="relative"
                        borderRadius="md"
                        overflow="hidden"
                        bg="gray.100"
                      >
                        <Image
                          src={item.url || item.thumbnailUrl}
                          alt={item.title || `Media ${idx + 1}`}
                          w="100%"
                          h="120px"
                          objectFit="cover"
                        />
                        {item.duration && (
                          <Text
                            position="absolute"
                            bottom={1}
                            right={1}
                            bg="blackAlpha.700"
                            color="white"
                            fontSize="xs"
                            px={1}
                            borderRadius="sm"
                          >
                            {item.duration}
                          </Text>
                        )}
                        <IconButton
                          icon={<FiDownload />}
                          aria-label="Download"
                          position="absolute"
                          bottom={1}
                          left={1}
                          size="xs"
                          bg="blackAlpha.600"
                          color="white"
                          _hover={{ bg: 'blackAlpha.800' }}
                        />
                      </Box>
                      <Text fontSize="sm" mt={1}>
                        {item.title || item.fileName || 'Video Title'}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <Text color="gray.400" fontSize="sm">
                  No media attached
                </Text>
              )}
            </Box>
          </VStack>
        </DrawerBody>

        <Flex
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
          px={8}
          py={4}
          justify="flex-end"
          gap={3}
        >
          <Button variant="outline" onClick={handleKeepUnresolved}>
            Keep as Unresolved
          </Button>
          <Button
            bg="teal.500"
            color="white"
            _hover={{ bg: 'teal.600' }}
            onClick={handleMarkResolved}
            isLoading={isLoading}
          >
            Save & Mark as Resolved
          </Button>
        </Flex>
      </DrawerContent>
    </Drawer>
  );
};
