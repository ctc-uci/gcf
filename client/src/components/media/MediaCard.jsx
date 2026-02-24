import { Box, Text } from '@chakra-ui/react';

export const MediaCard = ({ s3_key, file_name, file_type, is_thumbnail }) => {
  return (
    <Box
      h="200px"
      borderRadius="md"
      border="2px solid"
      borderColor="gray.800"
      p={4}
    >
      <Text>{s3_key}</Text> {/* TODO: render the image */}
    </Box>
  );
};
