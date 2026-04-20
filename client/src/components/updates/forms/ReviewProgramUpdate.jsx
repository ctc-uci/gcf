import {
  Button,
  Grid,
  GridItem,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

export const ReviewProgramUpdate = ({
  isOpen,
  onClose,
  onConfirm,
  changes = [],
  isLoading,
}) => {
  const { t } = useTranslation();
  const formatDisplayValue = (value) => {
    if (value === undefined || value === null || value === '') {
      return t('common.na');
    }

    if (typeof value === 'boolean') {
      return value ? t('common.yes') : t('common.no');
    }

    return value;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="md"
        p={4}
      >
        <ModalHeader
          fontSize="xl"
          fontWeight="bold"
          color="gray.800"
        >
          {t('common.reviewChanges')}
        </ModalHeader>

        <ModalBody color="gray.600">
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={6}
            rowGap={8}
          >
            {changes.map((field, idx) => (
              <GridItem key={idx}>
                <Text
                  fontSize="sm"
                  color="gray.500"
                  fontWeight="500"
                  mb={1}
                >
                  {field.label}
                </Text>

                {field.isTag ? (
                  <HStack
                    wrap="wrap"
                    spacing={2}
                  >
                    {field.oldTags?.map((tag, i) => (
                      <Tag
                        key={`old-${i}`}
                        size="md"
                        colorScheme="red"
                        textDecoration="line-through"
                      >
                        {tag}
                      </Tag>
                    ))}
                    {field.newTags?.map((tag, i) => (
                      <Tag
                        key={`new-${i}`}
                        size="md"
                        colorScheme="blue"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </HStack>
                ) : (
                  <HStack
                    spacing={2}
                    wrap="wrap"
                  >
                    {field.oldValue !== field.newValue &&
                      field.oldValue !== undefined &&
                      field.oldValue !== null && (
                        <Text
                          textDecoration="line-through"
                          color="gray.500"
                        >
                          {formatDisplayValue(field.oldValue)}
                        </Text>
                      )}
                    <Text color="gray.800">
                      {formatDisplayValue(field.newValue)}
                    </Text>
                  </HStack>
                )}
              </GridItem>
            ))}
          </Grid>
        </ModalBody>

        <ModalFooter
          gap={3}
          mt={6}
        >
          <Button
            onClick={onClose}
            bg="gray.100"
            color="gray.700"
            _hover={{ bg: 'gray.200' }}
            isDisabled={isLoading}
          >
            {t('common.continueEditing')}
          </Button>

          <Button
            colorScheme="teal"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {t('common.confirmChanges')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
