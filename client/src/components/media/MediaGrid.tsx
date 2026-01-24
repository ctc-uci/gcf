import {SimpleGrid, Flex, Text, VStack } from '@chakra-ui/react';
import {MediaCard} from './MediaCard';

interface MediaItem {
  id: string;
  s3_key: string;
  file_name: string;
  file_type: string;
  is_thumbnail: boolean;
}

interface MediaGridProps {
  mediaItems: MediaItem[];
}

export const MediaGrid = ({ mediaItems }: MediaGridProps) => {
  const displayedItems = mediaItems.slice(0, 3);

  // Always show 3 boxes
  const itemsToDisplay = displayedItems.length > 0 
    ? displayedItems 
    : Array(3).fill(null).map((_, index) => ({
        id: `empty-${index}`,
        s3_key: '',
        file_name: '',
        file_type: '',
        is_thumbnail: false
      }));

  return (
    <VStack align="start" spacing={4} w="full">
      <Text fontSize="lg" fontWeight="semibold" color="gray.800">
        Uploads
      </Text>

      <Flex gap={6} w="full" align="center">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} flex="1">
          {itemsToDisplay.map((item) => (
            <MediaCard key={item.id} {...item} />
          ))}
        </SimpleGrid>
        
        <Text
          fontSize="md"
          color="gray.800"
          cursor="pointer"
          _hover={{ textDecoration: 'underline' }}
        >
          See all
        </Text>
      </Flex>
    </VStack>
  );
};