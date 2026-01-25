import { Box, Text } from "@chakra-ui/react";

interface MediaCardProps {
  s3_key: string;
  file_name: string;
  file_type: string;
  is_thumbnail: boolean;
}

export const MediaCard = ({
  s3_key,
  file_name,
  file_type,
  is_thumbnail,
}: MediaCardProps) => {
  return (
    <Box
      h="200px"
      borderRadius="md"
      border="2px solid"
      borderColor="gray.800"
      p={4}
    >
      <Text>{s3_key}</Text>
    </Box>
  );
};
