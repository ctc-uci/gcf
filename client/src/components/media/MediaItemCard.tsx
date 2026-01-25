import React from "react";

import { Box, Skeleton, SkeletonText, VStack } from "@chakra-ui/react";

const MediaItemCard = () => {
  return (
    <VStack
      align="flex-start"
      spacing={3}
      w="full"
    >
      {/* Media Placeholder */}
      <Box
        w="full"
        h="140px"
        bg="gray.100"
        borderRadius="md"
        border="2px dashed"
        borderColor="gray.300"
        display="flex"
        alignItems="center"
        justifyContent="center"
      />

      {/* Metadata Placeholders */}
      <Box w="full">
        <Skeleton
          height="12px"
          mb={2}
          width="80%"
        />
        <Skeleton
          height="10px"
          width="40%"
        />
      </Box>
    </VStack>
  );
};

export default MediaItemCard;
