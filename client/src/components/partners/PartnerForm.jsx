import { useEffect, useRef, useState } from 'react';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

const PartnerForm = ({ isOpen, partner, onClose, onSave, onDelete }) => {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const cancelRef = useRef();
  const toast = useToast();

  useEffect(() => {
    setName(partner?.name ?? '');
    setNameError(false);
  }, [partner, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    try {
      if (partner) {
        await backend.put(`/partners/${partner.id}`, { name: name.trim() });
      } else {
        await backend.post('/partners', { name: name.trim() });
      }
      toast({
        title: t('partners.toastSaved'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onSave();
    } catch (err) {
      console.error('Error saving partner:', err);
      toast({
        title: t('partners.toastErrorSave'),
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await backend.delete(`/partners/${partner.id}`);
      toast({
        title: t('partners.toastDeleted'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setIsDeleteDialogOpen(false);
      onDelete();
    } catch (err) {
      console.error('Error deleting partner:', err);
      toast({
        title: t('partners.toastErrorDelete'),
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          {partner ? t('partners.editPartner') : t('partners.newPartnerTitle')}
        </DrawerHeader>
        <DrawerBody>
          <VStack spacing={4}>
            <FormControl
              isRequired
              isInvalid={nameError}
            >
              <FormLabel>{t('partners.partnerName')}</FormLabel>
              <Input
                value={name}
                placeholder={t('partners.partnerNamePlaceholder')}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(false);
                }}
              />
              {nameError && (
                <FormErrorMessage>
                  {t('partners.partnerNameRequired')}
                </FormErrorMessage>
              )}
            </FormControl>

            <Flex
              width="100%"
              justifyContent="space-between"
              mt={4}
            >
              {partner && (
                <Button
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  {t('common.delete')}
                </Button>
              )}
              <Flex
                gap={2}
                ml="auto"
              >
                <Button
                  variant="outline"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  colorScheme="teal"
                  isDisabled={!name.trim()}
                  onClick={handleSave}
                >
                  {t('common.save')}
                </Button>
              </Flex>
            </Flex>
          </VStack>

          <AlertDialog
            isOpen={isDeleteDialogOpen}
            leastDestructiveRef={cancelRef}
            onClose={() => setIsDeleteDialogOpen(false)}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader
                  fontSize="lg"
                  fontWeight="bold"
                >
                  {t('partners.deletePartnerTitle')}
                </AlertDialogHeader>
                <AlertDialogBody>
                  {t('partners.deletePartnerBody')}
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button
                    ref={cancelRef}
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={handleDelete}
                    ml={3}
                  >
                    {t('common.delete')}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          <AlertDialog
            isOpen={isCancelDialogOpen}
            leastDestructiveRef={cancelRef}
            onClose={() => setIsCancelDialogOpen(false)}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader
                  fontSize="lg"
                  fontWeight="bold"
                >
                  {t('regions.unsavedTitle')}
                </AlertDialogHeader>
                <AlertDialogBody>{t('regions.unsavedBody')}</AlertDialogBody>
                <AlertDialogFooter>
                  <Button
                    isDisabled={!name.trim()}
                    onClick={async () => {
                      await handleSave();
                      setIsCancelDialogOpen(false);
                    }}
                  >
                    {t('regions.saveExit')}
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      onClose();
                      setIsCancelDialogOpen(false);
                    }}
                    ml={3}
                  >
                    {t('common.exitWithoutSaving')}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PartnerForm;
