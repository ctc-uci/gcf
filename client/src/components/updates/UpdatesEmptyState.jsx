import { Box, Center, Icon, Text, VStack } from '@chakra-ui/react';
import { FiBell } from 'react-icons/fi';

export const UpdatesEmptyState = () => (
  <Center py={20}>
    <VStack spacing={4}>
      <Box
        bg="gray.100"
        borderRadius="full"
        w="200px"
        h="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon as={FiBell} boxSize="80px" color="gray.300" />
      </Box>
      <Text color="gray.400" fontSize="lg" textAlign="center">
        No updates have{'\n'}been made yet.
      </Text>
    </VStack>
  </Center>
);
