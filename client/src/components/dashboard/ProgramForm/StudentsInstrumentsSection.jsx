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
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';

export function StudentsInstrumentsSection({ formState, setFormData }) {
  const { backend } = useBackendContext();
  const [instruments, setInstruments] = useState([]);
  const [isAddingInstrument, setIsAddingInstrument] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [quantity, setQuantity] = useState(1);

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

    if (!instrumentName || quantity <= 0) return false;

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
            quantity: prevQty + quantity,
          },
        },
      };
    });

    setSelectedInstrument('');
    setNewInstrumentName('');
    setQuantity(1);
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
        Students &amp; Instruments
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
            Current Students
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
            Graduated Students
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
            Instrument &amp; Quantity
          </FormLabel>
          {!isAddingInstrument && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddingInstrument(true)}
            >
              + Add
            </Button>
          )}
          {isAddingInstrument && (
            <HStack
              align="flex-end"
              spacing={3}
              flexWrap="wrap"
            >
              <Select
                placeholder="Select Instrument"
                onChange={(e) => {
                  setSelectedInstrument(e.target.value);
                  setNewInstrumentName('');
                }}
                value={selectedInstrument}
                maxW="12rem"
              >
                {instruments.map((instrument) => (
                  <option
                    key={instrument.id}
                    value={String(instrument.id)}
                  >
                    {instrument.name}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Or type a new instrument"
                value={newInstrumentName}
                onChange={(e) => {
                  setNewInstrumentName(e.target.value);
                  setSelectedInstrument('');
                }}
                maxW="12rem"
              />
              <NumberInput
                value={quantity}
                min={1}
                onChange={(value) => {
                  const n = parseInt(value, 10);
                  setQuantity(Number.isNaN(n) ? 1 : n);
                }}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const added = await handleAddInstrumentAndQuantity();
                  if (added) setIsAddingInstrument(false);
                }}
              >
                + Add
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
                    {data.name} - {data.quantity}
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
