import {
  VStack,
  Card,
  CardBody,
  CardHeader,
  Text,
  Heading,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

export const ProgramUpdateEditForm = () => {
    return (
        <VStack p={8} width='35%' borderWidth="1px" borderColor="lightblue">
            <Heading size="md" textAlign="center">Program</Heading>
            <Divider w="110%" mb={4}></Divider>
            <Card bg='gray.100'>
                <CardHeader pt={6} pb={0}>
                    <Heading size="sm">Update Notes</Heading>
                </CardHeader>
                <CardBody py={1}>
                    <Text>
                        Instrument number went down due to damage, waiting on replacement strings. Recruited John Doe as a program director as they've been getting more involved. Student number updated from 100 to 120.
                    </Text>
                </CardBody>
            </Card>
            <FormControl isRequired>
                <FormLabel>Program Name</FormLabel>
                <Input placeholder='Program Name'/>
            </FormControl>
            <FormControl>
                <FormLabel>Status</FormLabel>
                <Select placeholder='Select Option'/>
            </FormControl>
            <FormControl>
                <FormLabel>Launch Date</FormLabel>
                <Select placeholder='Select Date'/>
            </FormControl>
            <FormControl>
                <FormLabel>Location</FormLabel>
                <Select placeholder='Select Location'/>
            </FormControl>
            <FormControl>
                <FormLabel>Students</FormLabel>
                <NumberInput>
                    <NumberInputField/>
                    <NumberInputStepper>
                        <NumberIncrementStepper/>
                        <NumberDecrementStepper/>
                    </NumberInputStepper>
                </NumberInput>
            </FormControl>
        </VStack>
    );
};
