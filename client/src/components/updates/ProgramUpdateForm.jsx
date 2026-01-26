
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
//   useDisclosure,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react'

export const ProgramUpdateForm = () => {
    // const { isOpen, onToggle } = useDisclosure()
    const [isAddingInstrument, setIsAddingInstrument] = useState(false)
    
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [enrollmentNumber, setEnrollmentNumber] = useState(null)
    const [graduatedNumber, setGraduatedNumber] = useState(null)
    const [notes, setNotes] = useState('')
    
    const [selectedInstrument, setSelectedInstrument] = useState('')
    const [newInstrumentName, setNewInstrumentName] = useState('')
    const [quantity, setQuantity] = useState(0)
    
    const [existingInstruments, setExistingInstruments] = useState([])
    const [addedInstruments, setAddedInstruments] = useState({})
    const [newInstruments, setNewInstruments] = useState([])

    // fetch instruments when form loads
    useEffect(() => {
        const fetchInstruments = async () => {
            try {
                const response = await axios.get('http://localhost:3001/instruments');
                setExistingInstruments(response.data);
            } catch (error) {
                console.error('Error fetching instruments:', error);
                // keep rendering if fetch fails
                setExistingInstruments([]);
            }
        };
        fetchInstruments();
    }, []);

    const removeInstrument = (name) => {
        setAddedInstruments(prev => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
        });
    };

    const validNewInstrument = () => {
        return newInstrumentName.trim().length > 0 && 
            !existingInstruments.some(instr => instr.name.toLowerCase() === newInstrumentName.trim().toLowerCase());
    }

    const handleNewInstrument = () => {
        if (!validNewInstrument()) {
            setNewInstrumentName('');
            return;
        }
    };

    const handleConfirmAddInstrument = () => {

        handleNewInstrument();

        if ((!selectedInstrument && !newInstrumentName)) {
            console.log("nothing selected")
            return; 
        }
        else if (quantity === 0) {
            console.log("quantity 0")
            return;
        }
        else if ((selectedInstrument && newInstrumentName)) {
            console.log("both selected")
            return; 
        }

        if (newInstrumentName) {
            setNewInstruments(prev => [...prev, newInstrumentName]);
        }
               
        setAddedInstruments(prev => ({
            ...prev,
            [selectedInstrument || newInstrumentName]: parseInt(quantity)
        }));
        
        
        setNewInstrumentName('');
        setSelectedInstrument('');
        setQuantity(0);
    };

    const handleSubmit = async () => {
        try {
            // validate required fields
            if (!title.trim() || !date || !notes.trim()) {
                console.error('Missing required fields.');
            }
            
            // create program update
            const programUpdateData = {
                title: title.trim(),
                program_id: 26, // TODO: replace with actual program id
                created_by: 1, // TODO: replace with actual user id
                update_date: date,
                note: notes.trim()
            };
            
            const response = await axios.post('http://localhost:3001/program-updates', programUpdateData);
            const programUpdateId = response.data.id;

            // add new instruments to DB
            console.log('New instruments to add:', newInstruments);
            for (const instrumentName of newInstruments) {
                try {
                    await axios.post('http://localhost:3001/instruments', {
                        name: instrumentName
                    });
                    console.log(`Added new instrument: ${instrumentName}`);
                } catch (error) {
                    console.error(`Error adding instrument ${instrumentName}:`, error);
                }
            }

            // refetch instruments to get their ids
            const instrumentsResponse = await axios.get('http://localhost:3001/instruments');
            setExistingInstruments(instrumentsResponse.data);

            console.log('Added Instruments:', addedInstruments);
            // create instrument changes if any instruments were added
            if (Object.keys(addedInstruments).length > 0) 
                {
                const instrumentChanges = Object.entries(addedInstruments).map(([name, qty]) => {
                    const instrument = instrumentsResponse.data.find(instr => instr.name === name);
                    console.log('instrumentsResponse, update id, and qty', instrumentsResponse, programUpdateId, qty);
                    return {
                        instrument_id: instrument.id,
                        update_id: programUpdateId,
                        amount_changed: qty
                    };
                });
                console.log('Sending instrument changes:', instrumentChanges[0]);
                
                for (const change of instrumentChanges) {
                await axios.post(
                    'http://localhost:3001/instrument-changes',
                    {
                        instrumentId: change.instrument_id,
                        updateId: change.update_id,
                        amountChanged: change.amount_changed
                    }
                );
}
            }

            // create enrollment change entries if both enrollment # and graduated # are provided
            if (enrollmentNumber !== null && graduatedNumber !== null) {
                console.log('Sending enrollment change:', { update_id: programUpdateId, enrollment_change: enrollmentNumber, graduated_change: graduatedNumber });
                await axios.post('http://localhost:3001/enrollmentChange', {
                    update_id: programUpdateId,
                    enrollment_change: enrollmentNumber,
                    graduated_change: graduatedNumber
                });
            }

            console.log('Sending program update data:', programUpdateId, enrollmentNumber, graduatedNumber);

            // clear form if submission was successful
            setTitle('');
            setDate('');
            setEnrollmentNumber(null);
            setGraduatedNumber(null);
            setNotes('');
            setAddedInstruments({});
            setNewInstruments([]);

            console.log('Program update submitted successfully');
        } catch (error) {
            console.error('Error submitting program update:', error);
        }
    }

    return (
        <VStack 
            p={8} 
            width='35%' 
            borderWidth="1px" 
            align="start" 
            spacing={4}
        >
            <HStack>
                <ArrowRightIcon color="gray"></ArrowRightIcon>
                <Heading size="md">
                    Create New Update
                </Heading>
            </HStack>
            <FormControl isRequired>
                <FormLabel fontWeight="normal" color="gray">
                    Title
                </FormLabel>
                <Input 
                    type="text" 
                    placeholder="Enter Title Here" 
                    bg="gray.100" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel fontWeight="normal" color="gray">
                    Date
                </FormLabel>
                <Input 
                    type="date" 
                    placeholder="MM/DD/YYYY" 
                    bg="gray.100" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                />
            </FormControl>
            <HStack>
            <FormControl>
                <FormLabel fontWeight="normal" color="gray">
                    # Students currently enrolled
                </FormLabel>
                <NumberInput 
                    width="30%" 
                    value={enrollmentNumber || ''} 
                    onChange={(value) => setEnrollmentNumber(value ? parseInt(value) : null)}
                >
                    <NumberInputField bg="gray.100"></NumberInputField>
                </NumberInput>
            </FormControl>
            <FormControl>
                <FormLabel fontWeight="normal" color="gray">
                    # Students graduated
                </FormLabel>
                <NumberInput 
                    width="30%" 
                    value={graduatedNumber || ''} 
                    onChange={(value) => setGraduatedNumber(value ? parseInt(value) : null)}
                >
                    <NumberInputField bg="gray.100"></NumberInputField>
                </NumberInput>
            </FormControl>
            </HStack>
            <FormControl>
                <FormLabel>Instruments & Quantity</FormLabel>
                {!isAddingInstrument && 
                <Button onClick={() => setIsAddingInstrument(true)}>+ Add</Button>}
                {isAddingInstrument && 
                <HStack>
                    <Select 
                        placeholder="Select" 
                        bg="gray.100"
                        value={selectedInstrument}
                        onChange={(e) => setSelectedInstrument(e.target.value)}
                    >
                        {existingInstruments.map(instrument => (
                            <option key={instrument.id} value={instrument.name}>
                                {instrument.name}
                            </option>
                        ))}
                    </Select>
                    <FormControl>
                    <Input 
                        placeholder="New Instrument" 
                        bg="gray.100"
                        value={newInstrumentName}
                        onChange={(e) => setNewInstrumentName(e.target.value)} 
                    />
                    </FormControl>
                    <NumberInput
                        value={quantity}
                        onChange={(value) => setQuantity(parseInt(value) || 0)}
                    >
                        <NumberInputField/>
                        <NumberInputStepper>
                            <NumberIncrementStepper/>
                            <NumberDecrementStepper/>
                        </NumberInputStepper>
                    </NumberInput>
                    <Button 
                        onClick={() => {setIsAddingInstrument(false); 
                                        handleConfirmAddInstrument();
                                        }}
                    >
                    Add
                    </Button>
                </HStack>               
                }
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
            <FormControl isRequired>
                <FormLabel fontWeight="normal" color="gray">
                    Notes
                </FormLabel>
                <Textarea 
                    borderWidth={1} 
                    borderColor="black" 
                    bg="gray.100" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                >
                </Textarea>
            </FormControl>
            <FormControl>
                <Button 
                    borderWidth={1} 
                    borderColor="black" 
                    bg="white">
                    + Add Media
                </Button>
            </FormControl>
            <Button 
                width="35%" 
                alignSelf="center" 
                borderWidth={1} 
                borderColor="black" 
                bg="gray.400"
                onClick={handleSubmit}
            >
                Submit
            </Button>
        </VStack>
        );
};

