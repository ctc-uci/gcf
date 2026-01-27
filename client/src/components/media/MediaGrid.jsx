import { SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { MediaCard } from "./MediaCard";

export const MediaGrid = ({ mediaItems, programName }) => {
  return (
    <VStack align="start" spacing={4} w="full">
      <Text
        fontSize="lg"
        fontWeight="semibold"
        color="gray.800"
      >
        Uploads
      </Text>


      {/* rn if the db finds a program with no media, itl print the program name
          but if it doesnt find a (program / nothing from db is found) itl print no program found
        
        like if u do 
        http://localhost:3000/media/3 => No media associated with Global Creation Foundation

        and

        http://localhost:3000/media/39 => No program found

        */}

      {(() => {
        if (mediaItems.length === 0 && !programName) {
          return <Text>No program found</Text>;
        }
        
        if (mediaItems.length === 0) {
          return <Text>No media associated with {programName}</Text>;
        }
        
        return (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={6}
            w="full"
          >
            {mediaItems.map((item) => (
              <MediaCard key={item.id} {...item} />
            ))}
          </SimpleGrid>
        );
      })()}
    </VStack>
);
};