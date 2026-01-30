import { SimpleGrid, Text, VStack } from "@chakra-ui/react";

import { MediaCard } from "./MediaCard";

export const MediaGrid = ({ mediaItems, programName }) => {
  let content;

  if (mediaItems.length === 0 && !programName) {
    content = <Text>No program found</Text>;
  } else if (mediaItems.length === 0) {
    content = <Text>No media associated with {programName}</Text>;
  } else {
    content = (
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        spacing={6}
        w="full"
      >
        {mediaItems.map((item) => (
          <MediaCard
            key={item.id}
            {...item}
          />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <VStack
      align="start"
      spacing={4}
      w="full"
    >
      <Text
        fontSize="lg"
        fontWeight="semibold"
        color="gray.800"
      >
        Uploads
      </Text>

      {content}
    </VStack>
  );
};
