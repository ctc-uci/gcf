import { useEffect, useState } from 'react';

import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
} from '@chakra-ui/react';

export function CurriculumLinkForm({
  formState,
  setFormData,
  programId,
  backend,
}) {
  const [link, setLink] = useState('');
  const [display, setDisplay] = useState('');
  const [selectedInstrumentId, setSelectedInstrumentId] = useState('');
  const [instruments, setInstruments] = useState([]);
  const [instrumentsLoading, setInstrumentsLoading] = useState(false);

  useEffect(() => {
    if (!backend) return;

    let cancelled = false;
    setInstrumentsLoading(true);

    const fetchInstruments = async () => {
      try {
        const route = programId
          ? `/program/${programId}/instruments`
          : '/instruments';
        const res = await backend.get(route);
        const data = Array.isArray(res.data) ? res.data : [];
        const list = programId
          ? data.map((inst) => ({
              id: inst.instrumentId ?? inst.id,
              name: inst.name,
            }))
          : data.map((inst) => ({ id: inst.id, name: inst.name }));
        if (!cancelled) setInstruments(list);
      } catch (err) {
        if (!cancelled) setInstruments([]);
        console.error('Error fetching instruments:', err);
      } finally {
        if (!cancelled) setInstrumentsLoading(false);
      }
    };

    fetchInstruments();
    return () => {
      cancelled = true;
    };
  }, [backend, programId]);

  function handleSubmit() {
    if (!link?.trim()) return;

    const instrumentId = selectedInstrumentId
      ? Number(selectedInstrumentId)
      : null;
    if (
      instrumentId === null ||
      instrumentId === undefined ||
      Number.isNaN(instrumentId)
    )
      return;

    let validLink = link.trim();
    if (!validLink.startsWith('http://') && !validLink.startsWith('https://')) {
      validLink = 'https://' + validLink;
    }

    const alreadyAdded = (formState.curriculumLinks ?? []).some(
      (p) => p.link === validLink && p.instrumentId === instrumentId
    );
    if (alreadyAdded) return;

    const instrumentName =
      instruments.find((i) => Number(i.id) === instrumentId)?.name ?? '';

    setFormData((prevData) => ({
      ...prevData,
      curriculumLinks: [
        ...(prevData.curriculumLinks ?? []),
        {
          link: validLink,
          name: (display || 'Playlist').trim() || 'Playlist',
          instrumentId,
          instrumentName,
        },
      ],
    }));

    setLink('');
    setDisplay('');
  }

  return (
    <HStack
      align="flex-end"
      spacing={2}
      wrap="wrap"
    >
      <FormControl
        flex="1"
        minW="120px"
      >
        <FormLabel fontSize="sm">Instrument</FormLabel>
        <Select
          placeholder="Select instrument"
          value={selectedInstrumentId}
          onChange={(e) => setSelectedInstrumentId(e.target.value)}
          isDisabled={instrumentsLoading}
          size="md"
        >
          {instruments.map((inst) => (
            <option
              key={inst.id}
              value={inst.id}
            >
              {inst.name}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl
        flex="1"
        minW="160px"
      >
        <FormLabel fontSize="sm">Link</FormLabel>
        <Input
          placeholder="Link"
          value={link || ''}
          onChange={(e) => setLink(e.target.value)}
        />
      </FormControl>
      <FormControl
        flex="1"
        minW="140px"
      >
        <FormLabel fontSize="sm">Display Name</FormLabel>
        <Input
          placeholder="Display Name"
          value={display || ''}
          onChange={(e) => setDisplay(e.target.value)}
        />
      </FormControl>
      <Button
        onClick={handleSubmit}
        isDisabled={!selectedInstrumentId}
      >
        + Add
      </Button>
    </HStack>
  );
}
