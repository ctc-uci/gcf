import {
  Box,
  Button,
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

import { InstrumentSearchInput } from '@/components/common/InstrumentSearchInput';
import {
  BsCalendarDate,
  BsMusicNoteBeamed,
  BsMusicNoteList,
  BsPlusLg,
} from 'react-icons/bs';
import { FaStar, FaTools } from 'react-icons/fa';
import { IoMdClose, IoMdPhotos } from 'react-icons/io';
import { MdOutlineQuestionMark } from 'react-icons/md';

import { ProgramSelector } from './ProgramSelector';

export const InstrumentUpdateForm = ({
  formState,
  setFormState,
  availablePrograms,
  existingInstruments,
}) => {
  const {
    programId,
    searchQuery,
    selectedInstrument,
    newInstrumentName,
    instrumentEvent,
    otherEventDescription,
    quantity,
    requiresAdminApproval,
    adminApprovalDetails,
    date,
  } = formState;

  return (
    <VStack
      spacing={6}
      align="stretch"
    >
      <ProgramSelector
        availablePrograms={availablePrograms}
        programId={programId}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, programId: value }))
        }
      />

      <FormControl>
        <FormLabel fontWeight="semibold">
          <HStack
            spacing={2}
            mb={1}
          >
            <Icon
              as={BsMusicNoteBeamed}
              color="black"
              boxSize={5}
            />
            <Text>
              Which instrument is this update about?{' '}
              <Text
                as="span"
                color="red.500"
              >
                *
              </Text>
            </Text>
          </HStack>
        </FormLabel>
        <FormLabel
          fontSize="sm"
          color="gray.600"
        >
          Select instrument{' '}
          <Text
            as="span"
            color="red.500"
          >
            *
          </Text>
        </FormLabel>
        <InstrumentSearchInput
          instruments={existingInstruments}
          value={searchQuery}
          onChange={(searchValue) => {
            if (searchValue) {
              setFormState((prev) => ({
                ...prev,
                searchQuery: searchValue,
                selectedInstrument: '',
                newInstrumentName: '',
              }));
            } else {
              setFormState((prev) => ({ ...prev, searchQuery: searchValue }));
            }
          }}
          onSelectExisting={(instrument) => {
            setFormState((prev) => ({
              ...prev,
              selectedInstrument: instrument.name,
              newInstrumentName: '',
              searchQuery: '',
            }));
          }}
          onCreateNew={(name) => {
            setFormState((prev) => ({
              ...prev,
              newInstrumentName: name.trim(),
              selectedInstrument: '',
              searchQuery: '',
            }));
          }}
          placeholder="Search instrument"
        />
        {(selectedInstrument || newInstrumentName) && (
          <Text
            fontSize="sm"
            color="gray.600"
            mt={1}
          >
            Selected: {selectedInstrument || newInstrumentName}
          </Text>
        )}
      </FormControl>

      <Box>
        <Text
          fontWeight="semibold"
          mb={3}
        >
          What happened to this instrument?
        </Text>
        <RadioGroup
          onChange={(value) =>
            setFormState((prev) => ({ ...prev, instrumentEvent: value }))
          }
          value={instrumentEvent}
        >
          <Stack spacing={3}>
            <Radio
              value="broken"
              colorScheme="teal"
            >
              <HStack spacing={2}>
                <Icon
                  as={IoMdClose}
                  color="black"
                />
                <Text>Broken</Text>
              </HStack>
            </Radio>
            <Radio
              value="missing"
              colorScheme="teal"
            >
              <HStack spacing={2}>
                <Icon
                  as={MdOutlineQuestionMark}
                  color="black"
                />
                <Text>Missing</Text>
              </HStack>
            </Radio>
            <Radio
              value="new_donation"
              colorScheme="teal"
            >
              <HStack spacing={2}>
                <Icon
                  as={BsMusicNoteList}
                  color="black"
                />
                <Text>New / Donation</Text>
              </HStack>
            </Radio>
            <Radio
              value="needs_repair"
              colorScheme="teal"
            >
              <HStack spacing={2}>
                <Icon
                  as={FaTools}
                  color="black"
                />
                <Text>Needs repair</Text>
              </HStack>
            </Radio>
            <Radio
              value="other"
              colorScheme="teal"
            >
              <Text>Other (please explain below)</Text>
            </Radio>
          </Stack>
        </RadioGroup>
        {instrumentEvent === 'other' && (
          <Textarea
            mt={3}
            value={otherEventDescription}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                otherEventDescription: e.target.value,
              }))
            }
            placeholder="Describe what happened…"
            borderColor="gray.100"
          />
        )}
      </Box>

      <FormControl>
        <FormLabel fontWeight="semibold">
          <HStack
            spacing={2}
            mb={1}
          >
            <Icon
              as={BsMusicNoteBeamed}
              color="black"
              boxSize={5}
            />
            <Text>
              How many instruments are affected?{' '}
              <Text
                as="span"
                color="red.500"
              >
                *
              </Text>
            </Text>
          </HStack>
        </FormLabel>
        <FormLabel
          fontSize="sm"
          color="gray.600"
        >
          Number of instruments{' '}
          <Text
            as="span"
            color="red.500"
          >
            *
          </Text>
        </FormLabel>
        <NumberInput
          step={1}
          min={0}
          value={quantity ?? ''}
          onChange={(valueString) =>
            setFormState((prev) => ({ ...prev, quantity: Number(valueString) }))
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

      {/* TODO: implement add media functionality */}
      <Box>
        <HStack
          spacing={2}
          mb={2}
        >
          <Icon
            as={IoMdPhotos}
            color="black"
            boxSize={5}
          />
          <Text fontWeight="semibold">
            Do you want to add photos or videos?
          </Text>
        </HStack>
        <Text
          fontSize="sm"
          color="gray.600"
          mb={3}
        >
          This helps us understand the issue.
        </Text>
        <Button
          size="sm"
          variant="outline"
          colorScheme="teal"
          borderColor="teal.600"
          leftIcon={<Icon as={BsPlusLg} />}
        >
          Add Media
        </Button>
      </Box>
      {/* TODO: admin approval implementation */}
      <Box>
        <HStack
          spacing={2}
          mb={3}
        >
          <Icon
            as={FaStar}
            color="black"
            boxSize={4}
          />
          <Text fontWeight="semibold">
            Do you need admin help or approval for this?
          </Text>
        </HStack>
        <Radio
          isChecked={requiresAdminApproval}
          onChange={() =>
            setFormState((prev) => ({
              ...prev,
              requiresAdminApproval: !prev.requiresAdminApproval,
            }))
          }
          colorScheme="teal"
        >
          Yes, this is a special request.
        </Radio>
        {requiresAdminApproval && (
          <Box mt={3}>
            <Text
              fontSize="sm"
              color="teal.600"
              mb={2}
            >
              What do you need?{' '}
              <Text
                as="span"
                color="red.500"
              >
                *
              </Text>
            </Text>
            <Textarea
              value={adminApprovalDetails}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  adminApprovalDetails: e.target.value,
                }))
              }
              placeholder="Example: replacement instruments or urgent repair"
              w="full"
              h="93px"
              minH="93px"
              maxH="93px"
              borderRadius="6px"
              borderWidth="1px"
              borderColor="gray.100"
              resize="none"
            />
          </Box>
        )}
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
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, date: e.target.value }))
            }
            borderColor="gray.100"
          />
        </FormControl>
      </Box>
    </VStack>
  );
};
