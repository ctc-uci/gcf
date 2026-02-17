
import { useState, useEffect } from 'react';
import { ArrowRightIcon, CloseIcon } from '@chakra-ui/icons'
import { useBackendContext } from '@/contexts/hooks/useBackendContext';

import 
{ VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  HStack,
  Select,
  Button,
  Textarea,
  Tag,
  TagLabel,
  TagCloseButton,
  IconButton,
  Box,
  useToast
} from '@chakra-ui/react'

export const ProgramUpdateForm = ( {programUpdateId, program_id=null} ) => {
    const [isLoading, setIsLoading] = useState(false)
    const [programId, setProgramId] = useState(program_id) //TODO: Get Program Id for Program Update
    
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [enrollmentNumber, setEnrollmentNumber] = useState(null)
    const [graduatedNumber, setGraduatedNumber] = useState(null)
    const [enrollmentChangeId, setEnrollmentChangeId] = useState(null) 
    const [notes, setNotes] = useState('')
    
    const [selectedInstrument, setSelectedInstrument] = useState('')
    const [newInstrumentName, setNewInstrumentName] = useState('')
    const [quantity, setQuantity] = useState(0)
    
    const [existingInstruments, setExistingInstruments] = useState([])
    const [addedInstruments, setAddedInstruments] = useState({})
    const [originalInstruments, setOriginalInstruments] = useState({}) 
    const [newInstruments, setNewInstruments] = useState([])
    const [instrumentChangeMap, setInstrumentChangeMap] = useState({}); 

    const { backend } = useBackendContext();
    const toast = useToast();

    useEffect(() => {
        if (!programUpdateId) {
            setProgramId(program_id);
        }
    }, [program_id, programUpdateId]);

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
    }, [backend]);

    useEffect(() => {
        const fetchProgramUpdate = async () => {
            if (!programUpdateId) {
                return;
            }
            
            setIsLoading(true);
            try {
                const response = await backend.get(`http://localhost:3001/program-updates/${programUpdateId}`);
                const data = response.data;
                
                setTitle(data.title || '');
                setDate(data.updateDate.split('T')[0] || '');
                setNotes(data.note || '');
                setProgramId(parseInt(data.programId, 10));

                try {
                    const enrollmentResponse = await backend.get(`http://localhost:3001/enrollmentChange/update/${programUpdateId}`);
                    if (enrollmentResponse.data && enrollmentResponse.data.length > 0) {
                        const enrollmentData = enrollmentResponse.data[enrollmentResponse.data.length - 1];
                        setEnrollmentChangeId(enrollmentData.id);
                        setEnrollmentNumber(enrollmentData.enrollmentChange || null);
                        setGraduatedNumber(enrollmentData.graduatedChange || null);
                    }
                } catch (error) {
                    console.error('Error fetching enrollment changes:', error);
                }

                try {
                    const instrumentChangesResponse = await backend.get(`http://localhost:3001/instrument-changes/update/${programUpdateId}`);
                    if (instrumentChangesResponse.data && instrumentChangesResponse.data.length > 0) {
                            const instrumentsMap = {};
                            const changeMeta = {};
                            for (const change of instrumentChangesResponse.data) {
                                const instrumentName = existingInstruments.find(i => i.id === change.instrumentId)?.name;
                                if (instrumentName) {
                                    instrumentsMap[instrumentName] = change.amountChanged;
                                    changeMeta[instrumentName] = { changeId: change.id, instrumentId: change.instrumentId };
                                }
                            }
                            setAddedInstruments(instrumentsMap);
                            setOriginalInstruments(JSON.parse(JSON.stringify(instrumentsMap))); 
                            setInstrumentChangeMap(changeMeta);
                        }
                } catch (error) {
                    console.error('Error fetching instrument changes:', error);
                }
            } catch (error) {
                console.error('Error fetching program update:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchProgramUpdate();
    }, [programUpdateId, existingInstruments, backend]);

    useEffect(() => {
        if (!programUpdateId) setProgramId(program_id);
    }, [programUpdateId, program_id]);

    const removeInstrument = (name) => {
        setAddedInstruments(prev => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
        });
        setNewInstruments(prev => prev.filter(n => n !== name));
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
        if (!title.trim() || !date || !notes.trim()) {
            toast({
                title: 'Validation error',
                description: 'Please fill in title, date, and notes.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        if (!programUpdateId && (programId === null || programId === undefined || programId === '')) {
            toast({
                title: 'Validation error',
                description: 'A program must be selected to create an update.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        setIsLoading(true);
        try {

            const programUpdateData = {
                title: title ? String(title).trim() : null,
                program_id: parseInt(programId, 10) || null,
                created_by: '1', // TODO: replace with actual user id
                update_date: date ? String(date) : null,
                note: notes ? String(notes).trim() : null
            };
            
            let updatedProgramUpdateId = programUpdateId;

            if (programUpdateId) {
                await backend.put(`http://localhost:3001/program-updates/${programUpdateId}`, programUpdateData);
            } else {
                const response = await backend.post('http://localhost:3001/program-updates', programUpdateData);
                updatedProgramUpdateId = response.data.id;
            }

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

            const deletedInstruments = Object.keys(originalInstruments).filter(name => !addedInstruments[name]);
            console.log('deletedInstruments to remove:', deletedInstruments);
            
            for (const deletedName of deletedInstruments) {
                try {
                    const changeMeta = instrumentChangeMap[deletedName];
                    console.log(`Deleting ${deletedName}, changeMeta:`, changeMeta);
                    
                    if (changeMeta && changeMeta.changeId) {
                        const delRes = await backend.delete(`http://localhost:3001/instrument-changes/${changeMeta.changeId}`);
                        console.log(`Successfully deleted instrument change for ${deletedName}:`, delRes && delRes.data ? delRes.data : delRes);

                        setInstrumentChangeMap(prev => {
                            const p = { ...prev };
                            delete p[deletedName];
                            return p;
                        });

                        setOriginalInstruments(prev => {
                            const p = { ...prev };
                            delete p[deletedName];
                            return p;
                        });
                    } else {
                        console.warn(`No changeId found for deleted instrument ${deletedName}`);
                    }
                } catch (error) {
                    console.error(`Error deleting instrument ${deletedName}:`, error);
                }
            }

            if (Object.keys(addedInstruments).length > 0) {
                for (const [name, qty] of Object.entries(addedInstruments)) {
                    const meta = instrumentChangeMap[name];
                    if (meta && meta.changeId) {
                        const originalQty = originalInstruments[name];
                        if (originalQty !== qty) {
                            try {
                                await backend.put(`http://localhost:3001/instrument-changes/${meta.changeId}`, {
                                    instrumentId: meta.instrumentId,
                                    updateId: updatedProgramUpdateId,
                                    amountChanged: qty
                                });
                                console.log(`Updated instrument change for ${name}`);
                            } catch (error) {
                                console.error(`Error updating instrument ${name}:`, error);
                            }
                        }
                    } else {
                        const instrument = instrumentsResponse.data.find(instr => instr.name === name);
                        if (instrument) {
                            try {
                                await backend.post('http://localhost:3001/instrument-changes', {
                                    instrumentId: instrument.id,
                                    updateId: updatedProgramUpdateId,
                                    amountChanged: qty
                                });
                                console.log(`Created instrument change for ${name}`);
                            } catch (error) {
                                console.error(`Error creating instrument change for ${name}:`, error);
                            }
                        }
                    }
                }
            }

            if (enrollmentNumber !== null) {
                if (enrollmentChangeId) {
                    await backend.put(`http://localhost:3001/enrollmentChange/${enrollmentChangeId}`, {
                        update_id: updatedProgramUpdateId,
                        enrollment_change: enrollmentNumber,
                        graduated_change: graduatedNumber || 0
                    });
                    console.log('Updated existing enrollment change');
                } else {
                    const enrollmentResponse = await backend.post('http://localhost:3001/enrollmentChange', {
                        update_id: updatedProgramUpdateId,
                        enrollment_change: enrollmentNumber,
                        graduated_change: graduatedNumber || 0
                    });
                    setEnrollmentChangeId(enrollmentResponse.data.id); 
                    console.log('Created new enrollment change');
                }
            }

            try {
                const finalEnrollmentResponse = await backend.get(`http://localhost:3001/enrollmentChange/update/${updatedProgramUpdateId}`);
                if (finalEnrollmentResponse.data && finalEnrollmentResponse.data.length > 0) {
                    const enrollmentData = finalEnrollmentResponse.data[finalEnrollmentResponse.data.length - 1];

                    setEnrollmentChangeId(enrollmentData.id);
                    setEnrollmentNumber(enrollmentData.enrollmentChange || null);
                    setGraduatedNumber(enrollmentData.graduatedChange || null);
                    console.log('Synced enrollment with server state:', enrollmentData);
                } else {
                    setEnrollmentChangeId(null);
                    setEnrollmentNumber(null);
                    setGraduatedNumber(null);
                }
            } catch (error) {
                console.error('Error refetching enrollment changes after submit:', error);
            }

            try {
                const finalInstrumentChangesResponse = await backend.get(`http://localhost:3001/instrument-changes/update/${updatedProgramUpdateId}`);
                if (finalInstrumentChangesResponse.data && finalInstrumentChangesResponse.data.length > 0) {
                    const instrumentsMap = {};
                    const changeMeta = {};
                    for (const change of finalInstrumentChangesResponse.data) {
                        const instrumentName = existingInstruments.find(i => i.id === change.instrumentId)?.name;
                        if (instrumentName) {
                            instrumentsMap[instrumentName] = change.amountChanged;
                            changeMeta[instrumentName] = { changeId: change.id, instrumentId: change.instrumentId };
                        }
                    }
                    setAddedInstruments(instrumentsMap);
                    setOriginalInstruments(JSON.parse(JSON.stringify(instrumentsMap)));
                    setInstrumentChangeMap(changeMeta);
                    console.log('Synced addedInstruments with server state:', instrumentsMap);
                } else {
                    setAddedInstruments({});
                    setOriginalInstruments({});
                    setInstrumentChangeMap({});
                }
            } catch (error) {
                console.error('Error refetching instrument changes after submit:', error);
                setAddedInstruments({});
            }

            setNewInstruments([]);
            setTitle('');
            setDate('');
            setEnrollmentNumber(null);
            setGraduatedNumber(null);
            setEnrollmentChangeId(null);
            setNotes('');
            setProgramId(program_id);
            setSelectedInstrument('');

            toast({
                title: programUpdateId ? 'Update saved' : 'Update created',
                description: programUpdateId
                    ? 'Program update was updated successfully.'
                    : 'Program update was created successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error submitting program update:', error);
            const message = error?.response?.data?.message ?? error?.message ?? 'Something went wrong. Please try again.';
            const statusCode = error?.response?.status;
            toast({
                title: 'Failed to save',
                description: statusCode ? `${message} (${statusCode})` : message,
                status: 'error',
                duration: 7000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <VStack 
            p={8} 
            width='100%'
            maxWidth='500px'
            borderWidth="1px" 
            align="start" 
            spacing={4}
            position="relative"
        >
            {/* TODO: Add OnClick */}
            <Box position="absolute" top={4} right={4}>
                <IconButton
                    aria-label="Close"
                    icon={<CloseIcon />}
                    variant="ghost"
                    size="sm"
                />
            </Box>

            <HStack w="90%">
                <ArrowRightIcon color="gray"></ArrowRightIcon>
                <Heading size="md">
                    Create New Update
                </Heading>
            </HStack>
            <FormControl >
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
            <FormControl >
                <FormLabel fontWeight="normal" color="gray">
                    Date
                </FormLabel>
                <Input 
                    width="50%"
                    type="date" 
                    placeholder="MM/DD/YYYY" 
                    color="black"
                    bg="#EBEAEA" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                />
            </FormControl>

            <HStack width="100%" spacing={4}>
                <FormControl flex={1}>
                    <FormLabel fontWeight="normal" color="gray">
                        # Students Currently Enrolled
                    </FormLabel>
                    <NumberInput
                        value={enrollmentNumber || ''} 
                        onChange={(value) => setEnrollmentNumber(value ? parseInt(value) : null)}
                    >
                        <NumberInputField bg="#EBEAEA" textAlign="center"></NumberInputField>
                    </NumberInput>
                </FormControl>
                <FormControl flex={1}>
                    <FormLabel fontWeight="normal" color="gray">
                        # Students Graduated
                    </FormLabel>
                    <NumberInput
                        value={graduatedNumber || ''} 
                        onChange={(value) => setGraduatedNumber(value ? parseInt(value) : null)}
                    >
                        <NumberInputField bg="#EBEAEA" textAlign="center"></NumberInputField>
                    </NumberInput>
                </FormControl>
            </HStack>

            <HStack width="100%" spacing={4}>
                <FormControl flex={1}>
                    <FormLabel fontWeight="normal" color="gray">
                        Instrument Type
                    </FormLabel>
                    <Select 
                        placeholder="Select" 
                        textAlign="center"
                        bg="#EBEAEA"
                        value={selectedInstrument}
                        onChange={(e) => setSelectedInstrument(e.target.value)}
                    >
                        {existingInstruments.map(instrument => (
                            <option key={instrument.id} value={instrument.name}>
                                {instrument.name}
                            </option>
                        ))}
                    </Select>
                </FormControl>
                <FormControl flex={1}>
                    <FormLabel fontWeight="normal" color="gray">
                        # Donated
                    </FormLabel>
                    <NumberInput
                        width="50%"
                        justifyContent="center"
                        value={quantity}
                        onChange={(value) => setQuantity(parseInt(value) || 0)}
                    >
                        <NumberInputField bg="#EBEAEA" justifyContent="center" textAlign="center"/>
                    </NumberInput>
                </FormControl>
            </HStack>

            <Button 
                size="sm"
                variant="outline"
                borderRadius="10px"
                borderColor="black"
                color="#515151"
                onClick={handleConfirmAddInstrument}
            >
                + Add instrument
            </Button>

            {Object.keys(addedInstruments).length > 0 && (
                <HStack width="100%" flexWrap="wrap" spacing={2}>
                    {Object.entries(addedInstruments).map(([name, quantity]) => (
                        <Tag key={name} size="md" bg="gray.200">
                            <TagLabel>{name} - {quantity}</TagLabel>
                            <TagCloseButton onClick={() => removeInstrument(name)} />
                        </Tag>
                    ))}
                </HStack>
            )}

            <FormControl>
                <FormLabel fontWeight="normal" color="gray">
                    Notes
                </FormLabel>
                <Textarea 
                    borderWidth={1} 
                    borderColor="black" 
                    bg="#EBEAEA" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    minH="120px"
                >
                </Textarea>
            </FormControl>

            <Button 
                variant="outline"
                size="sm"
                borderRadius="10px"
                borderColor="black"
                color="#515151"
            >
                + Add media
            </Button>

            <Button 
                position
                width="50%" 
                justifyContent="center"
                alignItems="center"
                borderWidth={1} 
                borderColor="black" 
                bg="#A6A6A6"
                onClick={handleSubmit}
                isLoading={isLoading}
            >
                {programUpdateId ? 'Update' : 'Submit'}
            </Button>
        </VStack>
        );
};

