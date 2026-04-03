import {
  Box,
  Button,
  CloseButton,
  Heading,
  HStack,
  Icon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { BsPencilSquare } from 'react-icons/bs';
import { FaTrophy, FaUserTimes } from 'react-icons/fa';
import { FiUserPlus, FiUsers } from 'react-icons/fi';

export default function CreateUpdateStudent({
  studentCount,
  setStudentCount,
  whatHappened,
  setWhatHappened,
  programEnrollmentCount,
  notes,
  setNotes,
}) {
  const { t } = useTranslation();
  return (
    <>
      <Box>
        <Heading
          size="sm"
          fontWeight="600"
          mb={3}
        >
          What happened to the students?{' '}
          <Text
            as="span"
            color="red.500"
          >
            *
          </Text>
        </Heading>
        <RadioGroup
          value={whatHappened}
          onChange={setWhatHappened}
        >
          <VStack
            align="start"
            spacing={2}
          >
            <Radio
              value="new_joined"
              colorScheme="teal"
            >
              <HStack spacing={2}>
                <Icon
                  as={FiUserPlus}
                  boxSize={4}
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
                  as={FaTrophy}
                  boxSize={4}
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
                  as={FaUserTimes}
                  boxSize={4}
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
          </VStack>
        </RadioGroup>
      </Box>

      <Box>
        <HStack
          spacing={2}
          mb={1}
        >
          <Icon
            as={FiUsers}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            How many students are affected?
          </Heading>
        </HStack>
        <Text color="gray.500" fontSize="sm" fontWeight="500" mb={1}>
          {t('updates.numberOfStudents')}{' '}
          <Text as="span" color="red.500">
            {t('common.requiredStar')}
          </Text>
        </Text>
        <NumberInput
          min={0}
          value={studentCount}
          onChange={(v) => setStudentCount(parseInt(v, 10) || 0)}
        >
          <NumberInputField placeholder="0" />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mt={2}
        >
          Total current students:{' '}
          <Text
            as="span"
            fontWeight="bold"
          >
            {programEnrollmentCount}
          </Text>
        </Text>
      </Box>

      <Box>
        <HStack
          spacing={2}
          mb={1}
        >
          <Icon
            as={BsPencilSquare}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            {t('updates.addNoteHeading')}
          </Heading>
        </HStack>
        <Text
          color="gray.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          {t('common.notes')}
        </Text>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('updates.addNotesPlaceholder')}
          minH="100px"
        />
      </Box>
    </>
  );
}
