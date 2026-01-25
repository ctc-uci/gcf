
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
  useDisclosure,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react'

export const ProgramUpdateForm = () => {
    const { isOpen, onToggle } = useDisclosure()
    const [newInstrumentName, setNewInstrumentName] = useState('')
    const [instruments, setInstruments] = useState([])
    const [selectedInstrument, setSelectedInstrument] = useState('')
    const [quantity, setQuantity] = useState(0)
    const [addedInstruments, setAddedInstruments] = useState({})

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

    const handleConfirm = () => {
        if (!selectedInstrument || quantity === 0) {
            return;
        }
                
        setAddedInstruments(prev => ({
            ...prev,
            [selectedInstrument]: parseInt(quantity)
        }));
        
        setSelectedInstrument('');
        setQuantity(0);
    };

    const removeInstrument = (name) => {
        setAddedInstruments(prev => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
        });
    };
    
    const addInstrument = async () => {
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
                <Input type="date" placeholder="MM/DD/YYYY" bg="gray.100"/>
            </FormControl>
            <FormControl>
                <FormLabel fontWeight="normal" color="gray">
                    # Students currently enrolled
                </FormLabel>
                <NumberInput width="30%">
                    <NumberInputField bg="gray.100"></NumberInputField>
                </NumberInput>
            </FormControl>
            <HStack width="100%">
                <Box>
                    <FormControl>
                        <FormLabel fontWeight="normal" color="gray">
                            Instruments
                        </FormLabel>
                        <Select 
                            placeholder="Select Instrument" 
                            bg="gray.100"
                            value={selectedInstrument}
                            onChange={(e) => setSelectedInstrument(e.target.value)}
                        >
                            {instruments.map(instrument => (
                                <option key={instrument.id} value={instrument.name}>
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
                    <NumberInput 
                        maxW="80px"
                        value={quantity}
                        onChange={(value) => setQuantity(parseInt(value) || 0)}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper/>
                            <NumberDecrementStepper/>
                        </NumberInputStepper>
                    </NumberInput>
                </Box>
                <Button mt={33} onClick={handleConfirm}>
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
                                <Button onClick={addInstrument}>
                                    OK
                                </Button>
                            </HStack>
                        </SlideFade>
                    </HStack>
                </FormControl>
                {
                    Object.keys(addedInstruments).length > 0 && (
                        <HStack width="100%" flexWrap="wrap" spacing={2}>
                            {Object.entries(addedInstruments).map(([name, quantity]) => (
                                <Tag key={name} size="lg" bg="gray.200">
                                    <TagLabel>{name} - {quantity}</TagLabel>
                                    <TagCloseButton onClick={() => removeInstrument(name)} />
                                </Tag>
                            ))}
                        </HStack>
                    )
                }
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

