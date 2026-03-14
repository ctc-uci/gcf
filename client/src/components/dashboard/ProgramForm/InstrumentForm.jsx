import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from '@chakra-ui/react';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { InstrumentSearchInput } from '@/components/common/InstrumentSearchInput';

export function InstrumentForm({ setFormData }) {
  const [instruments, setInstruments] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const { backend } = useBackendContext();

  async function handleCreateNewInstrument(name) {
    try {
      const response = await backend.post('/instruments', {
        name: name.trim(),
      });
      const newInst = response.data;
      setSelectedInstrument({
        id: newInst.id,
        name: newInst.name ?? name.trim(),
      });
      setInstruments((prev) => [
        ...prev,
        { id: newInst.id, name: newInst.name ?? name.trim() },
      ]);
    } catch (error) {
      console.error('Error creating instrument:', error);
    }
  }

  function handleSubmit() {
    if (!selectedInstrument || quantity === 0) return;

    setFormData((prevData) => ({
      ...prevData,
      instruments: {
        ...prevData.instruments,
        [String(selectedInstrument.id)]: {
          id: Number(selectedInstrument.id),
          name: selectedInstrument.name,
          quantity,
        },
      },
    }));

    setSelectedInstrument(null);
    setQuantity(0);
  }

  useEffect(() => {
    async function fetchInstruments() {
      try {
        const response = await backend.get('/instruments');
        const instrument_names = response.data;

        const instrumentMap = new Map();
        instrument_names.forEach((instrument) => {
          if (!instrumentMap.has(instrument.name)) {
            instrumentMap.set(instrument.name, instrument);
          }
        });
        const unique_instruments = Array.from(instrumentMap.values());
        setInstruments(unique_instruments);
      } catch (error) {
        console.error('Error fetching instruments:', error);
      }
    }
    fetchInstruments();
  }, [backend]);

  return (
    <HStack
      border="1px"
      borderColor="gray.200"
      padding="1"
      borderRadius="md"
      spacing={2}
      align="flex-start"
      wrap="wrap"
    >
      <Box flex="1" minW="12rem">
        <InstrumentSearchInput
          instruments={instruments}
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            if (val) setSelectedInstrument(null);
          }}
          onSelectExisting={(inst) => setSelectedInstrument(inst)}
          onCreateNew={handleCreateNewInstrument}
          placeholder="Search instrument"
        />
        {selectedInstrument && (
          <Text fontSize="sm" color="gray.600" mt={1}>
            Selected: {selectedInstrument.name}
          </Text>
        )}
      </Box>
      <NumberInput
        step={1}
        defaultValue={0}
        min={0}
        width="8em"
        value={quantity}
        onChange={(valueString) => setQuantity(Number(valueString))}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Button onClick={handleSubmit} isDisabled={!selectedInstrument}>
        + Add
      </Button>
    </HStack>
  );
}
