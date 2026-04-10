import { useState } from 'react';

import {
  Box,
  Button,
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
  useDisclosure,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';
import { MdDelete, MdEdit } from 'react-icons/md';
import { SlOptionsVertical } from 'react-icons/sl';

import { MediaDeleteModal } from './MediaDeleteModal';
import { MediaEditModal } from './MediaEditModal';
import gcf_globe from '/gcf_globe.png';

export const MediaCard = ({
  file_name,
  file_type,
  imageUrl,
  description,
  update_date,
  height = '200px',
  id,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const [isLoading, setIsLoading] = useState(true);
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const isVideo = file_type?.startsWith('video');

  const handleEditSave = async (newTitle, newDescription) => {
    try {
      await backend.put(`/mediaChange/${id}`, {
        file_name: newTitle,
        description: newDescription,
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await backend.delete(`/mediaChange/${id}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const confirmDelete = async () => {
    await handleDelete();
    onDeleteClose();
  };

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
            zIndex={2}
          />
          <MenuList
            minW="150px"
            p={0}
            m={0}
            boxShadow="xl"
            border="none"
            zIndex={3}
            position="absolute"
            top="0"
            right="0"
          >
            <MenuItem onClick={onEditModalOpen}>
              <HStack w="full">
                <Text fontWeight="semibold">Edit details</Text>
                <Spacer />
                <MdEdit />
              </HStack>
            </MenuItem>
            <MenuItem onClick={onDeleteOpen}>
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
        <Box
          position="absolute"
          inset={0}
          bg="blackAlpha.300"
          zIndex={1}
          pointerEvents="none"
        />
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
      <MediaEditModal
        isOpen={isEditModalOpen}
        onClose={onEditModalClose}
        onSave={handleEditSave}
        initialTitle={file_name}
        initialDescription={description}
      />
      <MediaDeleteModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};
