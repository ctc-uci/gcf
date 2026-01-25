
import { useState } from 'react';
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
  HStack,
  Select,
  Box,
  Button,
  Textarea,
} from '@chakra-ui/react'

export const ProgramUpdateForm = () => {
    // const [formData, setFormData] = useState({
    //     date: '',
    //     studentsEnrolled: 0,
    //     instrument: '',
    //     notes: '',
    //     media: []
    // });
    
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
            <FormControl>
                <HStack>
                    <Box width="40%">
                        <FormLabel fontWeight="normal" color="gray">
                            Instrument Type
                        </FormLabel>
                        <Select placeholder="Ukelele" bg="gray.100">

                        </Select>
                    </Box>
                    <Box width="20%">
                        <FormLabel fontWeight="normal" color="gray">
                            # Donated
                        </FormLabel>
                        <NumberInput bg="gray.100">
                            <NumberInputField></NumberInputField>
                        </NumberInput>
                    </Box>
                </HStack>
            </FormControl>
            <FormControl>
                <Button borderWidth={1} borderColor="black" bg="white">
                    + Add Instrument
                </Button>
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

