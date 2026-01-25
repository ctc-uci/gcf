
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRightIcon } from '@chakra-ui/icons'

import 
{ VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  HStack,
  Select,
  Button,
  Box,
  Textarea,
  SlideFade,
  useDisclosure
} from '@chakra-ui/react'

export const ProgramUpdateForm = () => {
    const { isOpen, onToggle } = useDisclosure()
    const [newInstrumentName, setNewInstrumentName] = useState('')
    const [instruments, setInstruments] = useState([])

    // fetch instruments when component loads
    useEffect(() => {
        const fetchInstruments = async () => {
            try {
                const response = await axios.get('http://localhost:3001/instruments');
                setInstruments(response.data);
            } catch (error) {
                console.error('Error fetching instruments:', error);
                // continue rendering even if fetch fails
                setInstruments([]);
            }
        };
        fetchInstruments();
    }, []);
    
    const handleAddInstrument = async () => {
        if (!newInstrumentName.trim()) {
            return;
        }
        // might want to check if instrument alr exists before adding
        try {
            await axios.post('http://localhost:3001/instruments', {
                name: newInstrumentName
            });

            // refetch instruments after adding to update dropdown menu
            const response = await axios.get('http://localhost:3001/instruments');
            setInstruments(response.data);

            setNewInstrumentName('');
            onToggle();
        } catch (error) {
            console.error('Error adding instrument:', error);
        }
    };

    return (
        <VStack p={8} width='35%' borderWidth="1px" align="start" spacing={4}>
            <HStack>
                <ArrowRightIcon color="gray"></ArrowRightIcon>
                <Heading size="md">
                    Create New Update
                </Heading>
            </HStack>
            <FormControl>
                <FormLabel fontWeight="normal" color="gray">
                    Date
                </FormLabel>
                <Input placeholder="MM/DD/YYYY" bg="gray.100"/>
            </FormControl>
            <FormControl>
                <FormLabel fontWeight="normal" color="gray">
                    # Students currently enrolled
                </FormLabel>
                <NumberInput>
                    <NumberInputField bg="gray.100"></NumberInputField>
                </NumberInput>
            </FormControl>
            <HStack width='100%'>
                <Box>
                    <FormControl>
                        <FormLabel fontWeight="normal" color="gray">
                            Instruments
                        </FormLabel>
                        <Select placeholder="Select Instrument" bg="gray.100">
                            {instruments.map(instrument => (
                                <option key={instrument.id} value={instrument.id}>
                                    {instrument.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <FormLabel fontWeight="normal" color="gray">
                            Quantity
                    </FormLabel>
                    <NumberInput maxW="80px">
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper/>
                            <NumberDecrementStepper/>
                        </NumberInputStepper>
                    </NumberInput>
                </Box>
                <Button mt={33}>
                    Confirm
                </Button>
            </HStack>
                <FormControl>
                    <HStack>
                        <Button onClick={onToggle} size='sm'borderWidth={1} borderColor="black" bg="white">
                            + Add Instrument
                        </Button>
                        <SlideFade in={isOpen} offsetX="-100px" offsetY="0px">
                            <HStack>
                                <Input 
                                    placeholder="New Instrument" 
                                    bg="gray.100"
                                    value={newInstrumentName}
                                    onChange={(e) => setNewInstrumentName(e.target.value)}
                                />
                                <Button onClick={handleAddInstrument}>
                                    OK
                                </Button>
                            </HStack>
                        </SlideFade>
                    </HStack>
                </FormControl>
            <FormControl>
                <FormLabel fontWeight="normal" color="gray">
                    Notes
                </FormLabel>
                <Textarea borderWidth={1} borderColor="black" bg="gray.100"></Textarea>
            </FormControl>
            <FormControl>
                <Button borderWidth={1} borderColor="black" bg="white">
                    + Add Media
                </Button>
            </FormControl>
            <Button width="35%" alignSelf="center" borderWidth={1} borderColor="black" bg="gray.400">
                Submit
            </Button>
        </VStack>
        );
};

