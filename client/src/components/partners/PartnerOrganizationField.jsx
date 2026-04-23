import { useEffect, useMemo, useState } from 'react';

import { Box, FormControl, FormLabel, Text } from '@chakra-ui/react';

import { SearchInput } from '@/components/common/SearchInput';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

export function PartnerOrganizationField({ valueId, onChangeId, label }) {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const resolvedLabel = label ?? t('partners.fieldLabel');
  const [partnerOrgs, setPartnerOrgs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <FormControl isRequired>
      <FormLabel
        size="sm"
        fontWeight="normal"
        color="gray"
      >
        {resolvedLabel}
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
          placeholder={t('partners.fieldPlaceholder')}
        />
        {selected && (
          <Text
            fontSize="sm"
            color="gray.600"
            mt={1}
          >
            {t('partners.fieldSelected', { name: selected.name })}
          </Text>
        )}
      </Box>
    </FormControl>
  );
}
