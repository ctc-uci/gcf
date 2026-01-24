
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
  Textarea
} from '@chakra-ui/react'

export const ProgramUpdateForm = () => {
    return (
        <VStack>
            <Heading>
                Create New Update
            </Heading>
            <FormControl>
                <FormLabel>
                    Date
                </FormLabel>
                <Input placeholder="MM/DD/YYYY"/>
            </FormControl>
            <FormControl>
                <FormLabel>
                    # Students currently enrolled
                </FormLabel>
                <NumberInput>
                    <NumberInputField></NumberInputField>
                </NumberInput>
            </FormControl>
            <FormControl>
                <HStack>
                    <Box>
                        <FormLabel>
                            Instrument Type
                        </FormLabel>
                        <Select placeholder="Ukelele">

                        </Select>
                    </Box>
                    <Box>
                        <FormLabel>
                            # Donated
                        </FormLabel>
                        <NumberInput>
                            <NumberInputField></NumberInputField>
                        </NumberInput>
                    </Box>
                </HStack>
            </FormControl>
            <FormControl>
                <Button>
                    + Add Instrument
                </Button>
            </FormControl>
            <FormControl>
                <FormLabel>
                    Notes
                </FormLabel>
                <Textarea></Textarea>
            </FormControl>
            <FormControl>
                <Button>
                    + Add Media
                </Button>
            </FormControl>
            <Button>
                Submit
            </Button>
        </VStack>
        );
};

