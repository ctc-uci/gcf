import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import { SearchInput } from '@/components/common/SearchInput';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

export function PartnerOrganizationField({
  valueId,
  onChangeId,
  label = 'Partner Organization',
}) {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const [partnerOrgs, setPartnerOrgs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgToDelete, setOrgToDelete] = useState(null);
  const deleteDisclosure = useDisclosure();

  const selected = useMemo(() => {
    const idNum =
      valueId === null || valueId === undefined || valueId === ''
        ? null
        : Number(valueId);
    if (idNum === null || Number.isNaN(idNum)) return null;
    return partnerOrgs.find((p) => Number(p.id) === idNum) ?? null;
  }, [valueId, partnerOrgs]);

  useEffect(() => {
    if (selected?.name) {
      setSearchQuery(selected.name);
    } else if (valueId === null || valueId === undefined || valueId === '') {
      setSearchQuery('');
    }
  }, [selected, valueId]);

  useEffect(() => {
    let cancelled = false;
    async function fetchPartnerOrgs() {
      try {
        const res = await backend.get('/partners');
        const rows = Array.isArray(res.data) ? res.data : [];
        if (!cancelled) setPartnerOrgs(rows);
      } catch (err) {
        console.error('Error fetching partner organizations:', err);
        if (!cancelled) setPartnerOrgs([]);
      }
    }
    fetchPartnerOrgs();
    return () => {
      cancelled = true;
    };
  }, [backend]);

  async function handleCreateNew(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) return;
    try {
      const res = await backend.post('/partners', { name: trimmed });
      const created = res.data;
      if (created?.id) {
        setPartnerOrgs((prev) => [...prev, created]);
        onChangeId?.(created.id);
      }
    } catch (err) {
      console.error('Error creating partner organization:', err);
    }
  }

  function handleDeleteClick(org) {
    setOrgToDelete(org);
    deleteDisclosure.onOpen();
  }

  async function handleConfirmDelete() {
    if (!orgToDelete) return;
    try {
      await backend.delete(`/partners/${orgToDelete.id}`);
      setPartnerOrgs((prev) => prev.filter((p) => p.id !== orgToDelete.id));
      if (Number(valueId) === Number(orgToDelete.id)) {
        onChangeId?.(null);
      }
      deleteDisclosure.onClose();
      setOrgToDelete(null);
    } catch (err) {
      console.error('Error deleting partner organization:', err);
    }
  }

  return (
    <>
      <FormControl isRequired>
        <FormLabel
          size="sm"
          fontWeight="normal"
          color="gray"
        >
          {label}
        </FormLabel>
        <Box>
          <SearchInput
            items={partnerOrgs}
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            onSelectExisting={(item) => {
              onChangeId?.(item.id);
              setSearchQuery('');
            }}
            onCreateNew={(name) => {
              handleCreateNew(name);
              setSearchQuery('');
            }}
            onDeleteItem={handleDeleteClick}
            placeholder="Enter Partner Organization"
          />
          {selected && (
            <Text
              fontSize="sm"
              color="gray.600"
              mt={1}
            >
              Selected: {selected.name}
            </Text>
          )}
        </Box>
      </FormControl>

      <Modal
        isOpen={deleteDisclosure.isOpen}
        onClose={deleteDisclosure.onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="md"
          p={2}
        >
          <ModalHeader
            fontSize="lg"
            fontWeight="semibold"
          >
            {t('partnerOrg.deleteTitle')}
          </ModalHeader>

          <ModalBody color="gray.600">
            {t('partnerOrg.deleteDesc', { name: orgToDelete?.name ?? '' })}
          </ModalBody>

          <ModalFooter
            justifyContent="center"
            gap={3}
          >
            <Button
              onClick={deleteDisclosure.onClose}
              bg="gray.100"
              _hover={{ bg: 'gray.200' }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmDelete}
            >
              {t('partnerOrg.deleteOrg')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
