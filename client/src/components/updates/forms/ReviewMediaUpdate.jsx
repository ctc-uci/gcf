import { useEffect, useState } from 'react';

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
  IconButton,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';

import { formatUpdateDisplayDate } from '@/utils/formatDate';
import { useTranslation } from 'react-i18next';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

import { useBackendContext } from '../../../contexts/hooks/useBackendContext';
import { DirectorAvatar } from '../../dashboard/ProgramForm/DirectorAvatar';
import { MediaCard } from '../../media/MediaCard';
import { MediaViewer } from '../MediaViewer';

export const ReviewMediaUpdate = ({ update, onClose, onUpdate }) => {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const updateId = update?.id;
  const [updates, setUpdates] = useState([]);
  const [mediaURLs, setMediaURLs] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const handleKeepUnresolved = () => {
    onClose();
  };

  const handleMarkResolved = async () => {
    if (updateId === null || updateId === undefined) return;
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

  useEffect(() => {
    if (!updateId) return;

    const fetchMedia = async () => {
      try {
        const mediaChanges = await backend.get(
          `/mediaChange/update/${updateId}`
        );
        const data = mediaChanges.data;

        const response = await Promise.all(
          data.map((media_change) =>
            backend.get(`/images/url/${media_change.s3Key}`)
          )
        );
        setUpdates(data);
        setMediaURLs(response.map((r) => r.data.url));
      } catch (err) {
        console.error('Failed to fetch media:', err);
      }
    };
    fetchMedia();
  }, [updateId, backend]);

  return (
    <>
      <Drawer
        isOpen={true}
        onClose={onClose}
        placement="right"
        size={isFullScreen ? 'full' : 'lg'}
      >
        <DrawerOverlay />
        <DrawerContent maxW={isFullScreen ? '100%' : '50%'}>
          <Flex
            position="absolute"
            top={3}
            left={3}
            zIndex={1}
          >
            <IconButton
              icon={isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
              aria-label={
                isFullScreen
                  ? t('fullscreenFlyout.minimize')
                  : t('fullscreenFlyout.expand')
              }
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreen(!isFullScreen)}
            />
          </Flex>

          <Box
            pt={6}
            pb={2}
            px={8}
          >
            <Text
              fontSize="xl"
              fontWeight="600"
              textAlign="center"
            >
              {t('updates.mediaUpdateTitle')}
            </Text>
            <Divider mt={3} />
          </Box>

          <DrawerBody
            px={8}
            pb={24}
          >
            <VStack
              spacing={6}
              align="stretch"
              mt={4}
            >
              <Grid
                templateColumns="repeat(3, 1fr)"
                gap={6}
              >
                <GridItem>
                  <Text
                    color="teal.500"
                    fontSize="sm"
                    fontWeight="500"
                    mb={1}
                  >
                    {t('updates.colAuthor')}
                  </Text>
                  <HStack spacing={1}>
                    <DirectorAvatar
                      picture={update?.picture}
                      name={[update?.firstName, update?.lastName]
                        .filter(Boolean)
                        .join(' ')}
                      boxSize="28px"
                    />
                    <Text>
                      {update?.firstName} {update?.lastName}
                    </Text>
                  </HStack>
                </GridItem>
                <GridItem>
                  <Text
                    color="teal.500"
                    fontSize="sm"
                    fontWeight="500"
                    mb={1}
                  >
                    {t('updates.colProgram')}
                  </Text>
                  <Text>{update?.programName ?? ''}</Text>
                </GridItem>
                <GridItem>
                  <Text
                    color="teal.500"
                    fontSize="sm"
                    fontWeight="500"
                    mb={1}
                  >
                    {t('common.time')}
                  </Text>
                  <Text>
                    {formatUpdateDisplayDate(update?.updatedAt) || ''}
                  </Text>
                </GridItem>
              </Grid>

              <Box>
                <Text
                  color="teal.500"
                  fontSize="sm"
                  fontWeight="500"
                  mb={2}
                >
                  {t('common.note')}
                </Text>
                <Text>{update?.note || ''}</Text>
              </Box>

              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="600"
                  mb={3}
                >
                  {t('updates.mediaSection')}
                </Text>
                {updates.length > 0 ? (
                  <SimpleGrid
                    columns={{ base: 2, md: 3, lg: 4 }}
                    spacing={4}
                  >
                    {updates.map((item, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        cursor="pointer"
                        borderRadius="md"
                      >
                        <Box
                          position="relative"
                          borderRadius="md"
                          overflow="hidden"
                          bg="gray.100"
                        >
                          <MediaCard
                            id = {item.id}
                            file_name={item.fileName}
                            file_type={item.fileType}
                            imageUrl={mediaURLs[idx]}
                          />
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text
                    color="gray.400"
                    fontSize="sm"
                  >
                    {t('updates.noMediaAttached')}
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
            <Button
              variant="outline"
              onClick={handleKeepUnresolved}
            >
              {t('common.keepUnresolved')}
            </Button>
            <Button
              bg="teal.500"
              color="white"
              _hover={{ bg: 'teal.600' }}
              onClick={handleMarkResolved}
              isLoading={isLoading}
            >
              {t('common.saveMarkResolved')}
            </Button>
          </Flex>
        </DrawerContent>
      </Drawer>
      {selectedIndex !== null && (
        <MediaViewer
          updates={updates}
          mediaURLs={mediaURLs}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onUpdate = {onUpdate}
        />
      )}
    </>
  );
};
