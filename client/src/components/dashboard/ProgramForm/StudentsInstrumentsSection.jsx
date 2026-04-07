import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Tag,
  TagCloseButton,
  TagLabel,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { SearchInput } from '@/components/common/SearchInput';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

export function StudentsInstrumentsSection({ formState, setFormData }) {
  const { t } = useTranslation('translation');
  const toast = useToast();
  const { backend } = useBackendContext();
  const [instruments, setInstruments] = useState([]);
  const [isAddingInstrument, setIsAddingInstrument] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [newInstrumentName, setNewInstrumentName] = useState('');
  /** Plain string so the field can be cleared while typing; validated on Add only. */
  const [quantityInput, setQuantityInput] = useState('1');

  useEffect(() => {
    if (selectedInstrument && !Number.isNaN(Number(selectedInstrument))) {
      const found = instruments.find(
        (i) => Number(i.id) === Number(selectedInstrument)
      );
      if (found?.name) {
        setSearchQuery(found.name);
        return;
      }
    }
    const pending = newInstrumentName.trim();
    if (pending) {
      setSearchQuery(pending);
      return;
    }
    if (
      (!selectedInstrument || selectedInstrument === '') &&
      !newInstrumentName.trim()
    ) {
      setSearchQuery('');
    }
  }, [selectedInstrument, instruments, newInstrumentName]);

  useEffect(() => {
    let cancelled = false;
    async function fetchInstruments() {
      try {
        const response = await backend.get('/instruments');
        if (!cancelled) {
          setInstruments(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error fetching instruments:', error);
        if (!cancelled) setInstruments([]);
      }
    }
    fetchInstruments();
    return () => {
      cancelled = true;
    };
  }, [backend]);

  /** @returns {Promise<boolean>} true if an instrument line was added */
  async function handleAddInstrumentAndQuantity() {
    const typed = newInstrumentName.trim();
    const chosen = String(selectedInstrument || '').trim();
    const instrumentName = chosen || typed;

    if (!instrumentName) return false;

    const qty = parseInt(quantityInput.trim(), 10);
    if (Number.isNaN(qty) || qty < 1) {
      toast({
        title: t('programForm.instrumentQuantityInvalid'),
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return false;
    }

    let instrumentId = null;
    let resolvedName = instrumentName;

    if (chosen) {
      const found = instruments.find((i) => String(i.id) === chosen);
      if (found) {
        instrumentId = found.id;
        resolvedName = found.name;
      }
    }

    if (instrumentId === null && typed) {
      try {
        const response = await backend.post('/instruments', { name: typed });
        const created = response.data;
        instrumentId = created.id;
        resolvedName = created.name ?? typed;
        setInstruments((prev) => {
          if (prev.some((i) => Number(i.id) === Number(instrumentId))) {
            return prev;
          }
          return [...prev, { id: instrumentId, name: resolvedName }];
        });
      } catch (error) {
        console.error('Error creating instrument:', error);
        return false;
      }
    }

    if (instrumentId === null) return false;

    const idKey = String(instrumentId);
    setFormData((prev) => {
      const prevQty = prev.instruments[idKey]?.quantity ?? 0;
      return {
        ...prev,
        instruments: {
          ...prev.instruments,
          [idKey]: {
            id: Number(instrumentId),
            name: resolvedName,
            quantity: prevQty + qty,
          },
        },
      };
    });

    setSelectedInstrument('');
    setNewInstrumentName('');
    setQuantityInput('1');
    return true;
  }

  function removeInstrument(instrumentId) {
    setFormData((prevData) => {
      const { [instrumentId]: _, ...remaining } = prevData.instruments;
      return {
        ...prevData,
        instruments: remaining,
      };
    });
  }

  return (
    <Box>
      <Heading
        size="md"
        fontWeight="semibold"
        mb={3}
      >
        {t('programForm.studentsAndInstruments')}
      </Heading>
      <VStack
        align="stretch"
        spacing={3}
      >
        <FormControl>
          <FormLabel
            fontWeight="normal"
            color="gray"
          >
            {t('programForm.currentStudents')}
          </FormLabel>
          <NumberInput
            width="100%"
            min={0}
            value={formState.students}
            onChange={(value) => {
              const n = parseInt(value, 10);
              setFormData((prev) => ({
                ...prev,
                students: Number.isNaN(n) ? 0 : n,
              }));
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel
            fontWeight="normal"
            color="gray"
          >
            {t('programForm.graduatedStudentsLabel')}
          </FormLabel>
          <NumberInput
            width="100%"
            min={0}
            value={formState.graduatedStudents}
            onChange={(value) => {
              const n = parseInt(value, 10);
              setFormData((prev) => ({
                ...prev,
                graduatedStudents: Number.isNaN(n) ? 0 : n,
              }));
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel
            fontWeight="normal"
            color="gray"
          >
            {t('programForm.instrumentAndQuantity')}
          </FormLabel>
          {!isAddingInstrument && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedInstrument('');
                setNewInstrumentName('');
                setQuantityInput('1');
                setIsAddingInstrument(true);
              }}
            >
              {t('common.add')}
            </Button>
          )}
          {isAddingInstrument && (
            <HStack
              align="flex-end"
              spacing={3}
              flexWrap="wrap"
            >
              <Box
                flex="1"
                minW="12rem"
                maxW="16rem"
              >
                <SearchInput
                  items={instruments}
                  value={searchQuery}
                  onChange={(val) => setSearchQuery(val)}
                  onSelectExisting={(instrument) => {
                    setSelectedInstrument(String(instrument.id));
                    setNewInstrumentName('');
                    setSearchQuery('');
                  }}
                  onCreateNew={(name) => {
                    setSelectedInstrument('');
                    setNewInstrumentName(name.trim());
                    setSearchQuery('');
                  }}
                />
              </Box>
              <Input
                type="text"
                inputMode="numeric"
                value={quantityInput}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '' || /^\d+$/.test(v)) {
                    setQuantityInput(v);
                  }
                }}
                width="5.5rem"
                aria-label={t('programForm.instrumentQuantityAria')}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const added = await handleAddInstrumentAndQuantity();
                  if (added) setIsAddingInstrument(false);
                }}
              >
                {t('common.add')}
              </Button>
            </HStack>
          )}
        </FormControl>

        {Object.keys(formState.instruments || {}).length > 0 && (
          <HStack
            width="100%"
            flexWrap="wrap"
            spacing={2}
          >
            {Object.entries(formState.instruments).map(
              ([instrumentId, data]) => (
                <Tag
                  key={instrumentId}
                  size="lg"
                  bg="gray.200"
                >
                  <TagLabel>
                    {t('programForm.instrumentQuantityPair', {
                      name: data.name,
                      qty: data.quantity,
                    })}
                  </TagLabel>
                  <TagCloseButton
                    onClick={() => removeInstrument(instrumentId)}
                  />
                </Tag>
              )
            )}
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
