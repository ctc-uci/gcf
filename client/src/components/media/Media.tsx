import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Heading,
  VStack,
  Button,
} from '@chakra-ui/react';
import { MediaGrid } from './MediaGrid';

interface MediaItem {
  id: string;
  s3_key: string;
  file_name: string;
  file_type: string;
  is_thumbnail: boolean;
}

export const Media = () => {
  const { userid } = useParams<{ userid: string }>();
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchMediaData = async () => {
      try {
        const response = await fetch(`/api/media/user/${userid}`);
        const data = await response.json();
        setMedia(data.media || []);
      } catch (err) {
        console.error('Error fetching media:', err);
      }
    };

    if (userid) {
      fetchMediaData();
    }
  }, [userid]);

  const handleNewMedia = () => {
    console.log('New media button clicked');
  };

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" py={8}>
        <Box
          borderRadius="lg"
          p={8}
        >
          <VStack align="start" spacing={6} w="full">
            <Heading size="xl" color="gray.800">
              My Media
            </Heading>
            
            <Button
              variant="outline"
              bg="white"
              borderColor="gray.800"
              color="gray.800"
              _hover={{ bg: 'gray.50' }}
              onClick={handleNewMedia}
            >
              + New
            </Button>

            <MediaGrid mediaItems={media} />
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};