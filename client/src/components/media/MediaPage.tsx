import React from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  VStack,
  Icon,
  Link,
} from "@chakra-ui/react";
import { FiPlus, FiArrowRight } from "react-icons/fi";
import MediaItemCard from "./MediaItemCard";

export const MediaPage = () => {
  // Mock data array to render multiple cards
  const uploads = [1, 2, 3];

  return (
    <Box p={8} bg="white" minH="100vh">
      <VStack align="flex-start" spacing={8} maxW="1200px" mx="auto">
        
        {/* Header Section */}
        <VStack align="flex-start" spacing={4}>
          <Heading size="lg" letterSpacing="tight">
            My Media
          </Heading>
          <Button
            leftIcon={<FiPlus />}
            variant="outline"
            borderColor="gray.400"
            color="gray.700"
            size="md"
            px={6}
          >
            New
          </Button>
        </VStack>

        {/* Gallery Section */}
        <Box w="full">
          <HStack justify="space-between" mb={6}>
            <Text fontWeight="bold" fontSize="lg" color="gray.600">
              Uploads
            </Text>
            <Link color="blue.500" fontWeight="medium">
              <HStack spacing={1}>
                <Text>See all</Text>
                <Icon as={FiArrowRight} />
              </HStack>
            </Link>
          </HStack>

          {/* Grid of Components */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
            {uploads.map((item) => (
              <MediaItemCard key={item} />
            ))}
          </SimpleGrid>
        </Box>
        
      </VStack>
    </Box>
  );
};