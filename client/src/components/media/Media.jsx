import { useCallback, useEffect, useState } from 'react';

import { AddIcon, SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

import { MediaViewer } from '../updates/MediaViewer';
import { MediaGrid } from './MediaGrid';
import { MediaUploadModal } from './MediaUploadModal';

export const Media = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { backend } = useBackendContext();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [media, setMedia] = useState([]);
  const [programName, setProgramName] = useState('');
  const [programId, setProgramId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerIndex, setViewerIndex] = useState(null);

  const onUploadCompleteHandler = async (uploadedFiles, description) => {
    try {
      const updateDate = new Date().toISOString().split('T')[0];
      const programUpdateResponse = await backend.post('/program-updates', {
        title: 'Media Upload',
        program_id: programId,
        created_by: userId,
        update_date: updateDate,
        note: description || 'Media files uploaded',
      });

      const updateId = programUpdateResponse.data.id;

      const newMediaItems = [];
      for (const file of uploadedFiles) {
        const mediaChangeResponse = await backend.post('/mediaChange', {
          update_id: updateId,
          s3_key: file.s3_key,
          file_name: file.file_name,
          file_type: file.file_type || 'image',
          is_thumbnail: false,
          description: file.description,
        });

        const urlResponse = await backend.get(
          `/images/url/${encodeURIComponent(file.s3_key)}`
        );

        newMediaItems.push({
          id: mediaChangeResponse.data.id,
          update_id: mediaChangeResponse.data.update_id,
          s3_key: file.s3_key,
          file_name: file.file_name,
          file_type: file.file_type || 'image',
          is_thumbnail: false,
          imageUrl: urlResponse.data.url,
          description: file.description,
          update_date: null,
        });
      }

      setMedia((prevMedia) => [...newMediaItems, ...prevMedia]);
      fetchData();
    } catch (error) {
      console.error('Error saving uploaded files:', error);
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await backend.get(`/mediaChange/${userId}/media`);

      const transformedMedia = await Promise.all(
        response.data.media.map(async (media) => {
          const urlResponse = await backend.get(
            `/images/url/${encodeURIComponent(media.s3Key)}`
          );
          let update_date = null;
          try {
            const programUpdateDateResponse = await backend.get(
              `/program-updates/${media.updateId}/date`
            );
            update_date = programUpdateDateResponse.data;
          } catch (error) {
            console.error('Error fetching update date:', error);
          }
          return {
            id: media.id,
            update_id: media.updateId,
            s3_key: media.s3Key,
            file_name: media.fileName,
            file_type: media.fileType,
            is_thumbnail: media.isThumbnail,
            imageUrl: urlResponse.data.url,
            description: media.description,
            update_date: update_date,
          };
        })
      );

      setMedia(transformedMedia);
      setProgramName(response.data.programName);
      setProgramId(response.data.programId);
    } catch (error) {
      console.error('Error loading media data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [backend, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMedia = media.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.file_name || '').toLowerCase().includes(query) ||
      (item.description || '').toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Center>
    );
  }

  return (
    <Box
      minH="100vh"
      mt={-10}
      ml={-10}
    >
      <Box
        borderRadius="lg"
        p={8}
        ml={4}
        mt={2}
      >
        <VStack
          align="start"
          spacing={6}
          w="full"
        >
          <HStack
            w="full"
            justify="space-between"
            align="center"
            spacing={4}
          >
            <Heading
              size="xl"
              color="gray.800"
            >
              {t('mediaPage.title')}
            </Heading>
            <InputGroup
              w="60"
              maxW="400px"
              size="sm"
            >
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder={t('mediaPage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              backgroundColor="teal.500"
              color="white"
              _hover={{ backgroundColor: 'teal.600' }}
              onClick={onOpen}
            >
              {t('mediaPage.uploadMedia')}
            </Button>
          </HStack>

          <MediaGrid
            mediaItems={filteredMedia}
            programName={programName}
            onUpdate={fetchData}
            onCardClick={(index) => setViewerIndex(index)}
          />
        </VStack>
      </Box>
      <MediaUploadModal
        isOpen={isOpen}
        onClose={onClose}
        onUploadComplete={onUploadCompleteHandler}
      />
      {viewerIndex !== null && filteredMedia[viewerIndex] && (
        <MediaViewer
          updates={filteredMedia.map((m) => ({
            id: m.id,
            fileName: m.file_name,
            fileType: m.file_type,
            description: m.description,
          }))}
          mediaURLs={filteredMedia.map((m) => m.imageUrl)}
          selectedIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onUpdate={fetchData}
        />
      )}
    </Box>
  );
};
