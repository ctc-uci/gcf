import { SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { MediaCard } from "./MediaCard";

export const MediaGrid = ({ mediaItems }) => {
  return (
    <VStack align="start" spacing={4} w="full">
      <Text
        fontSize="lg"
        fontWeight="semibold"
        color="gray.800"
      >
        Uploads
      </Text>

      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        spacing={6}
        w="full"
      >
        {mediaItems.map((item) => (
          <MediaCard key={item.id} {...item} />
        ))}
      </SimpleGrid>
    </VStack>
  );
};