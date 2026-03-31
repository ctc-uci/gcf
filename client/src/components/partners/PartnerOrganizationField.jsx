import { useEffect, useMemo, useState } from 'react';

import { Box, FormControl, FormLabel, Text } from '@chakra-ui/react';

import { SearchInput } from '@/components/common/SearchInput';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';

export function PartnerOrganizationField({
  valueId,
  onChangeId,
  label = 'Partner Organization',
}) {
  const { backend } = useBackendContext();
  const [partnerOrgs, setPartnerOrgs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const selected = useMemo(() => {
    const idNum =
      valueId === null || valueId === undefined || valueId === ''
        ? null
        : Number(valueId);
    if (!idNum) return null;
    return partnerOrgs.find((p) => Number(p.id) === idNum) ?? null;
  }, [valueId, partnerOrgs]);

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
      <FormLabel>{label}</FormLabel>
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
          placeholder="Search or add partner organization"
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
  );
}
