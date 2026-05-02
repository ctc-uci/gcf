import { useEffect, useState } from 'react';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { ReviewProgramUpdate } from '../updates/forms/ReviewProgramUpdate';

export const MediaEditModal = ({
  isOpen,
  onClose,
  onSave,
  initialTitle,
  initialDescription,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(initialTitle || '');
    setDescription(initialDescription || '');
  }, [initialTitle, initialDescription]);

  const handleCancel = () => {
    setTitle(initialTitle || '');
    setDescription(initialDescription || '');
    onClose();
  };

  const handleSave = () => {
    setIsReviewOpen(true);
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await Promise.resolve(onSave(title, description));
      setIsReviewOpen(false);
      onClose();
    } catch {
      // keeps modal open and allows user to try saving again
    } finally {
      setIsSaving(false);
    }
  };

  const changes = [
    { label: t('mediaEditModal.titlePlaceholder'), oldValue: initialTitle, newValue: title },
    { label: t('mediaEditModal.descriptionPlaceholder'), oldValue: initialDescription, newValue: description },
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleCancel} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('mediaEditModal.heading')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Input
                placeholder={t('mediaEditModal.titlePlaceholder')}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <Textarea
                placeholder={t('mediaEditModal.descriptionPlaceholder')}
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={handleCancel}>{t('common.cancel')}</Button>
            <Button colorScheme="teal" onClick={handleSave}>{t('common.save')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ReviewProgramUpdate
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleConfirm}
        changes={changes}
        isLoading={isSaving}
      />
    </>
  );
};