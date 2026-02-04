
import { useState, useEffect } from 'react';
import { ArrowRightIcon } from '@chakra-ui/icons'
import { useBackendContext } from '@/contexts/hooks/useBackendContext';

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
  Textarea,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react'

export const ProgramUpdateForm = ( {programId} ) => {
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

    const { backend } = useBackendContext();

    useEffect(() => {
        const fetchInstruments = async () => {
            try {
                const response = await backend.get('http://localhost:3001/instruments');
                setExistingInstruments(response.data);
            } catch (error) {
                console.error('Error fetching instruments:', error);
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
            if (!title.trim() || !date || !notes.trim()) {
                return;
            }
            
            const programUpdateData = {
                title: title.trim(),
                program_id: programId,
                created_by: 1, // TODO: replace with actual user id
                update_date: date,
                note: notes.trim()
            };
            
            const response = await backend.post('http://localhost:3001/program-updates', programUpdateData);
            const programUpdateId = response.data.id;

            for (const instrumentName of newInstruments) {
                try {
                    await backend.post('http://localhost:3001/instruments', {
                        name: instrumentName
                    });
                } catch (error) {
                    console.error(`Error adding instrument ${instrumentName}:`, error);
                }
            }

            const instrumentsResponse = await backend.get('http://localhost:3001/instruments');
            setExistingInstruments(instrumentsResponse.data);

            if (Object.keys(addedInstruments).length > 0) 
                {
                const instrumentChanges = Object.entries(addedInstruments).map(([name, qty]) => {
                    const instrument = instrumentsResponse.data.find(instr => instr.name === name);
                    return {
                        instrument_id: instrument.id,
                        update_id: programUpdateId,
                        amount_changed: qty
                    };
                });
                
                for (const change of instrumentChanges) {
                await backend.post(
                    'http://localhost:3001/instrument-changes',
                    {
                        instrumentId: change.instrument_id,
                        updateId: change.update_id,
                        amountChanged: change.amount_changed
                    }
                );
}
            }

            if (enrollmentNumber !== null && graduatedNumber !== null) {
                await backend.post('http://localhost:3001/enrollmentChange', {
                    update_id: programUpdateId,
                    enrollment_change: enrollmentNumber,
                    graduated_change: graduatedNumber
                });
            }

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

