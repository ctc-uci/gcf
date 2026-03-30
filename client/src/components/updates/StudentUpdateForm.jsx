import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import { BsCalendarDate, BsTrophyFill } from 'react-icons/bs';
import { FaEdit } from 'react-icons/fa';
import { FaUserPlus, FaUserXmark } from 'react-icons/fa6';
import { HiMiniUsers } from 'react-icons/hi2';

import { ProgramSelector } from './ProgramSelector';

export const StudentUpdateForm = ({
  formState,
  dispatch,
  availablePrograms,
  programStudentCounts,
}) => {
  const { programId, studentEvent, enrollmentNumber, date, notes } = formState;

  const set = (field) => (value) =>
    dispatch({ type: 'SET_FIELD', field, value });

  return (
    <VStack
      spacing={6}
      align="stretch"
    >
      <ProgramSelector
        availablePrograms={availablePrograms}
        programId={programId}
        onChange={set('programId')}
      />

      <Box>
        <Text
          fontWeight="semibold"
          mb={3}
        >
          What happened to the students?
        </Text>
        <RadioGroup
          onChange={set('studentEvent')}
          value={studentEvent}
        >
          <Stack spacing={3}>
            <Radio
              value="new_joined"
              colorScheme="teal"
            >
              <HStack spacing={2}>
                <Icon
                  as={FaUserPlus}
                  color="black"
                />
                <Text>New students joined</Text>
              </HStack>
            </Radio>
            <Radio
              value="graduated"
              colorScheme="teal"
            >
              <HStack spacing={2}>
                <Icon
                  as={BsTrophyFill}
                  color="black"
                />
                <Text>Graduated</Text>
              </HStack>
            </Radio>
            <Radio
              value="quit"
              colorScheme="teal"
            >
              <HStack spacing={2}>
                <Icon
                  as={FaUserXmark}
                  color="black"
                />
                <Text>Quit</Text>
              </HStack>
            </Radio>
            <Radio
              value="other"
              colorScheme="teal"
            >
              <Text>Other (please explain in note below)</Text>
            </Radio>
          </Stack>
        </RadioGroup>
      </Box>

      <Box>
        <HStack
          spacing={2}
          mb={3}
        >
          <Icon
            as={HiMiniUsers}
            color="black"
            boxSize={5}
          />
          <Text fontWeight="semibold">How many students are affected?</Text>
        </HStack>
        <FormControl>
          <FormLabel
            fontSize="sm"
            color="gray.600"
          >
            Number of students{' '}
            <Text
              as="span"
              color="red.500"
            >
              *
            </Text>
          </FormLabel>
          <NumberInput
            min={0}
            value={enrollmentNumber ?? ''}
            onChange={(value) =>
              set('enrollmentNumber')(
                value !== '' && value !== undefined
                  ? parseInt(String(value), 10)
                  : null
              )
            }
          >
            <NumberInputField
              borderColor="gray.100"
              placeholder="0"
              _placeholder={{ color: 'gray.400' }}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <Text
          mt={2}
          fontSize="sm"
          color="teal.600"
        >
          Total current students:{' '}
          <Text
            as="span"
            fontWeight="bold"
          >
            {programStudentCounts[programId] ?? 0}
          </Text>
        </Text>
      </Box>

      <Box>
        <HStack
          spacing={2}
          mb={3}
        >
          <Icon
            as={BsCalendarDate}
            color="black"
            boxSize={5}
          />
          <Text fontWeight="semibold">What is today's date?</Text>
        </HStack>
        <Text
          fontSize="sm"
          color="teal.600"
          mb={3}
        >
          Date{' '}
          <Text
            as="span"
            color="red.500"
          >
            *
          </Text>
        </Text>
        <FormControl>
          <Input
            type="date"
            value={date}
            onChange={(e) => set('date')(e.target.value)}
            borderColor="gray.100"
          />
        </FormControl>
      </Box>

      <Box>
        <HStack
          spacing={2}
          mb={3}
        >
          <Icon
            as={FaEdit}
            color="black"
            boxSize={5}
          />
          <Text fontWeight="semibold">Add a note</Text>
        </HStack>
        <FormControl>
          <FormLabel
            fontSize="sm"
            color="gray.600"
          >
            Notes
          </FormLabel>
          <Textarea
            value={notes}
            onChange={(e) => set('notes')(e.target.value)}
            minH="120px"
            placeholder="Add notes"
            borderColor="gray.100"
          />
        </FormControl>
      </Box>
    </VStack>
  );
};
