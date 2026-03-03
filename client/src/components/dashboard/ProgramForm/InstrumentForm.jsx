import { useEffect, useState } from "react";
import {
  Button,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
} from "@chakra-ui/react";
import { useBackendContext } from "@/contexts/hooks/useBackendContext";

export function InstrumentForm({ setFormData }) {
  const [instruments, setInstruments] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState("");
  const { backend } = useBackendContext();

  function handleSubmit() {
    if (!selectedInstrumentId || quantity === 0) return;

    const instrumentObj = instruments.find(
      (instrument) => String(instrument.id) === String(selectedInstrumentId)
    );
    if (!instrumentObj) return;
    setFormData((prevData) => ({
      ...prevData,
      instruments: {
        ...prevData.instruments,
        [selectedInstrumentId]: {
          id: Number(selectedInstrumentId),
          name: instrumentObj.name,
          quantity,
        },
      },
    }));

    setSelectedInstrumentId("");
    setQuantity(0);
  }

  useEffect(() => {
    async function fetchInstruments() {
      try {
        const response = await backend.get("/instruments");
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
        console.error("Error fetching instruments:", error);
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
    >
      <Select
        placeholder="Select Instrument"
        value={selectedInstrumentId}
        onChange={(e) => setSelectedInstrumentId(e.target.value)}
      >
        {instruments.map((instrument) => (
          <option key={instrument.id} value={instrument.id}>
            {instrument.name}
          </option>
        ))}
      </Select>
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
      <Button onClick={handleSubmit}> + Add </Button>
    </HStack>
  );
}
