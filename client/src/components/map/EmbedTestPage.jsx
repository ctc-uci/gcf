import { Box, Container, Heading, Text } from '@chakra-ui/react';

export const EmbedTestPage = () => {
  return (
    <Container
      maxW="container.xl"
      py="40px"
    >
      <Heading mb="10px">Embedded Map Test Page</Heading>
      <Text
        mb="30px"
        color="gray.600"
      >
        This page demonstrates how the GCF map component can be embedded on an
        external website via an iframe pointed at the{' '}
        <Text
          as="code"
          bg="gray.100"
          px="6px"
          py="2px"
          borderRadius="sm"
        >
          /embed/map
        </Text>{' '}
        route.
      </Text>

      <Box
        w="100%"
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
        boxShadow="sm"
      >
        <Box
          as="iframe"
          src="/embed/map"
          title="GCF Map Embed"
          width="100%"
          height="1100px"
          border="0"
          display="block"
        />
      </Box>
    </Container>
  );
};

export default EmbedTestPage;
