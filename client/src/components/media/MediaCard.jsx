import { Box, Image, Center } from "@chakra-ui/react";
import { useState } from "react";

import gcf_globe from "../../../public/gcf_globe.png";

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
          <Image
            src={gcf_globe}
            alt="Loading..."
            w="50px"
          />
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
