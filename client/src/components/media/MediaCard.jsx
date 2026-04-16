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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';
import { BsFillPencilFill, BsFillTrashFill } from 'react-icons/bs';
import { FiPlay } from 'react-icons/fi';
import { SlOptionsVertical } from 'react-icons/sl';

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
  onClick,
}) => {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
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
  const isPdf = file_type === 'application/pdf';

  const handleEditSave = async (newTitle, newDescription) => {
    try {
      await backend.put(`/mediaChange/${id}`, {
        file_name: newTitle,
        description: newDescription,
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating media:', error);
      throw error;
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
      p={4}
    >
      <Box
        h={height}
        borderRadius="xl"
        position="relative"
        overflow="hidden"
        cursor="pointer"
        onClick={onClick}
      >
        <Menu
          isLazy
          placement="top-end"
          gutter={0}
          offset={[0, -40]}
        >
          <Box onClick={(e) => e.stopPropagation()}>
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
                  <Text fontWeight="semibold">
                    {t('mediaEditModal.heading')}
                  </Text>
                  <Spacer />
                  <BsFillPencilFill />
                </HStack>
              </MenuItem>
              <MenuItem onClick={onDeleteOpen}>
                <HStack w="full">
                  <Text
                    color="red.500"
                    fontWeight="semibold"
                  >
                    {t('common.delete')}
                  </Text>
                  <Spacer />
                  <BsFillTrashFill />
                </HStack>
              </MenuItem>
            </MenuList>
          </Box>
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
              alt={t('mediaCard.loadingAlt')}
              w="50px"
              borderRadius="xl"
            />
          </Center>
        )}
        {isVideo ? (
          <>
            <video
              src={imageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
              onLoadedData={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
            {!isLoading && (
              <Center
                position="absolute"
                inset={0}
                zIndex={1}
                pointerEvents="none"
              >
                <Box
                  bg="blackAlpha.600"
                  borderRadius="full"
                  p={3}
                >
                  <FiPlay
                    size={24}
                    color="white"
                  />
                </Box>
              </Center>
            )}
          </>
        ) : isPdf ? (
          <>
            <iframe
              src={imageUrl}
              title={file_name}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: isLoading ? 'none' : 'block',
                borderRadius: '6px',
              }}
              onLoad={() => setIsLoading(false)}
            />
            {!isLoading && (
              <IconButton
                aria-label={t('mediaCard.expandPdf')}
                icon={<span style={{ fontSize: '16px' }}>⛶</span>}
                size="sm"
                position="absolute"
                bottom={2}
                right={2}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                zIndex={2}
              />
            )}
          </>
        ) : (
          <Image
            src={imageUrl}
            h="100%"
            w="100%"
            objectFit="contain"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}
      </Box>

      {isPdf && (
        <Modal
          isOpen={isExpanded}
          onClose={() => setIsExpanded(false)}
          size="6xl"
        >
          <ModalOverlay />
          <ModalContent h="90vh">
            <ModalCloseButton zIndex={1} />
            <ModalBody p={0}>
              <iframe
                src={imageUrl}
                title={file_name}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '6px',
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      <HStack
        align="flex-start"
        mt={2}
      >
        <Text
          color="gray.700"
          fontSize="md"
          fontWeight="semibold"
          isTruncated
        >
          {file_name}
        </Text>
        <Spacer />
        <Text
          color="gray.700"
          fontSize="md"
          flexShrink={0}
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
        isTruncated
      >
        {description || t('mediaCard.noDescription')}
      </Text>
      <MediaEditModal
        isOpen={isEditModalOpen}
        onClose={onEditModalClose}
        onSave={handleEditSave}
        initialTitle={file_name}
        initialDescription={description}
      />
      <Modal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('mediaCard.deleteModalHeader')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{t('mediaCard.deleteModalBody')}</ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onDeleteClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmDelete}
            >
              {t('mediaCard.deleteMedia')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
