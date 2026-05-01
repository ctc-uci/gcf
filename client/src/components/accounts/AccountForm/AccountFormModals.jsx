import {
  Badge,
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import { getRoleBadgeProps, LABEL_COLOR } from './constants';

export const AccountFormExitModal = ({
  isOpen,
  onClose,
  onExitWithoutSaving,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        py={6}
        px={4}
      >
        <ModalBody textAlign="center">
          <Text
            fontWeight="bold"
            fontSize="lg"
            mb={2}
          >
            {t('accountForm.exitTitle')}
          </Text>
          <Text
            color="gray.500"
            mb={6}
          >
            {t('accountForm.exitDesc')}
          </Text>
          <HStack
            spacing={3}
            justify="center"
          >
            <Button
              variant="outline"
              onClick={onClose}
            >
              {t('common.continueEditing')}
            </Button>
            <Button
              bg="red.500"
              color="white"
              _hover={{ bg: 'red.600' }}
              onClick={onExitWithoutSaving}
            >
              {t('common.exitWithoutSaving')}
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const AccountFormDeleteModal = ({
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={isDeleting ? () => {} : onClose}
      closeOnOverlayClick={!isDeleting}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        py={6}
        px={4}
      >
        <ModalBody textAlign="center">
          <Text
            fontWeight="bold"
            fontSize="lg"
            mb={2}
          >
            {t('accountForm.deleteTitle')}
          </Text>
          <Text
            color="gray.500"
            mb={6}
          >
            {t('accountForm.deleteDesc')}
          </Text>
          <HStack
            spacing={3}
            justify="center"
          >
            <Button
              variant="outline"
              onClick={onClose}
              isDisabled={isDeleting}
            >
              {t('common.continueEditing')}
            </Button>
            <Button
              bg="red.500"
              color="white"
              _hover={{ bg: 'red.600' }}
              onClick={onConfirmDelete}
              isLoading={isDeleting}
            >
              {t('accountForm.deleteAccount')}
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const AccountFormSaveReviewModal = ({
  isOpen,
  onClose,
  changedFields,
  onConfirm,
  isLoading,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="lg"
    >
      <ModalOverlay />
      <ModalContent
        py={6}
        px={6}
      >
        <ModalBody>
          <Text
            fontWeight="bold"
            fontSize="lg"
            color="teal.600"
            mb={4}
          >
            {t('common.reviewChanges')}
          </Text>

          <VStack
            spacing={3}
            align="stretch"
          >
            {changedFields.map((change, idx) => (
              <Box key={idx}>
                <Text
                  color={LABEL_COLOR}
                  fontSize="sm"
                  fontWeight="medium"
                  mb={1}
                >
                  {change.label}
                </Text>
                {change.isBadge ? (
                  <HStack spacing={2}>
                    <Badge
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      textDecoration="line-through"
                      {...getRoleBadgeProps(change.old)}
                    >
                      {change.old}
                    </Badge>
                    <Badge
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      {...getRoleBadgeProps(change.new)}
                    >
                      {change.new}
                    </Badge>
                  </HStack>
                ) : (
                  <Text>
                    {change.old && (
                      <Text
                        as="span"
                        textDecoration="line-through"
                        color="gray.400"
                        mr={2}
                      >
                        {change.old}
                      </Text>
                    )}
                    <Text as="span">{change.new}</Text>
                  </Text>
                )}
              </Box>
            ))}
          </VStack>

          <HStack
            spacing={3}
            justify="center"
            mt={6}
          >
            <Button
              variant="outline"
              onClick={onClose}
            >
              {t('common.continueEditing')}
            </Button>
            <Button
              bg="teal.500"
              color="white"
              _hover={{ bg: 'teal.600' }}
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {t('common.confirmChanges')}
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
