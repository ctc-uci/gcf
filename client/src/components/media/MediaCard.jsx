import { useState } from 'react';

import {
  Box,
  Center,
  HStack,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { MdDelete, MdEdit } from 'react-icons/md';
import { SlOptionsVertical } from 'react-icons/sl';

import gcf_globe from '/gcf_globe.png';

export const MediaCard = ({
  file_name,
  file_type,
  imageUrl,
  description,
  update_date,
  height = '200px',
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const isVideo = file_type?.startsWith('video');

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      bg="gray.100"
    >
      <Box
        h={height}
        mt={4}
        ml={3}
        mr={3}
        borderRadius="xl"
        position="relative"
        overflow="hidden"
      >
        <Menu
          isLazy
          placement="top-end"
          gutter={0}
          offset={[0, -40]}
        >
          <MenuButton
            as={IconButton}
            icon={<SlOptionsVertical />}
            size="md"
            colorScheme="none"
            position="absolute"
            top="4px"
            right="0px"
            zIndex="docked"
          />
          <MenuList
            minW="150px"
            p={0}
            m={0}
            boxShadow="xl"
            border="none"
            zIndex="popover"
            position="absolute"
            top="0"
            right="0"
          >
            <MenuItem>
              <HStack w="full">
                <Text fontWeight="semibold">Edit details</Text>
                <Spacer />
                <MdEdit />
              </HStack>
            </MenuItem>
            <MenuItem>
              <HStack w="full">
                <Text
                  color="red.500"
                  fontWeight="semibold"
                >
                  Delete
                </Text>
                <Spacer />
                <MdDelete />
              </HStack>
            </MenuItem>
          </MenuList>
        </Menu>
        {isLoading && (
          <Center h="100%">
            <Image
              src={gcf_globe}
              w="50px"
              borderRadius="xl"
            />
          </Center>
        )}
        {isVideo ? (
          <video
            src={imageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: 'xl',
            }}
            onLoadedData={() => setIsLoading(false)}
          />
        ) : (
          <Image
            src={imageUrl}
            h="100%"
            w="100%"
            objectFit="contain"
            borderRadius="xl"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </Box>
      <HStack>
        <Text
          color="gray.700"
          fontSize="md"
          fontWeight="semibold"
          mt={2}
          px={2}
          isTruncated
        >
          {file_name}
        </Text>
        <Spacer />
        <Text
          color="gray.700"
          fontSize="md"
          mt={2}
          px={2}
          isTruncated
        >
          {update_date
            ? new Date(update_date.updateDate).toLocaleDateString()
            : ''}
        </Text>
      </HStack>
      <Text
        color="gray.500"
        fontSize="xs"
        fontWeight="medium"
        mt={1}
        px={2}
        isTruncated
      >
        {description || 'No description available'}
      </Text>
    </Box>
  );
};
