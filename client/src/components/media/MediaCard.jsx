import { Box, Image, Center, Spinner } from "@chakra-ui/react";
import { useState } from "react";

export const MediaCard = ({ file_name, file_type, imageUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const isVideo = file_type?.startsWith("video");

  return (
    <Box
      h="200px"
      borderRadius="md"
      border="2px solid"
      borderColor="gray.800"
      p={4}
      overflow="hidden"
      bg="gray.100"
    >
      {isLoading && (
        <Center h="100%">
          <Spinner size="sm" />
        </Center>
      )}
      {isVideo ? (
        <video
          src={imageUrl}
          controls
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: isLoading ? "none" : "block",
          }}
          onLoadedData={() => setIsLoading(false)}
        />
      ) : (
        <Image
          src={imageUrl}
          alt={file_name}
          w="100%"
          h="100%"
          objectFit="contain"
          display={isLoading ? "none" : "block"}
          onLoad={() => setIsLoading(false)}
        />
      )}
    </Box>
  );
};
