import {
  Box,
  Button,
  Checkbox,
  CloseButton,
  Heading,
  HStack,
  Icon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Textarea,
} from '@chakra-ui/react';

import { FiCamera, FiEdit3, FiStar, FiUsers } from 'react-icons/fi';

export default function CreateUpdateStudent({
  studentCount,
  setStudentCount,
  uploadedMedia,
  removeMedia,
  onOpenMediaUpload,
  needsAdminHelp,
  setNeedsAdminHelp,
  notes,
  setNotes,
}) {
  return (
    <>
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
            How many students are currently enrolled?
          </Heading>
        </HStack>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          Number of students{' '}
          <Text
            as="span"
            color="red.500"
          >
            *
          </Text>
        </Text>
        <NumberInput
          min={0}
          value={studentCount}
          onChange={(v) => setStudentCount(v)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </Box>

      <Box>
        <HStack
          spacing={2}
          mb={1}
        >
          <Icon
            as={FiCamera}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            Do you want to add photos or videos?
          </Heading>
        </HStack>
        <Text
          color="teal.500"
          fontSize="sm"
          mb={2}
        >
          Optional for documentation
        </Text>
        {uploadedMedia.length > 0 && (
          <HStack
            spacing={2}
            wrap="wrap"
            mb={2}
          >
            {uploadedMedia.map((media, idx) => (
              <Box
                key={idx}
                position="relative"
              >
                <Box
                  boxSize="80px"
                  bg="gray.100"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize="xs"
                    textAlign="center"
                    px={1}
                  >
                    {media.file_name}
                  </Text>
                </Box>
                <CloseButton
                  size="sm"
                  position="absolute"
                  top={-1}
                  right={-1}
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  _hover={{ bg: 'red.600' }}
                  onClick={() => removeMedia(idx)}
                />
              </Box>
            ))}
          </HStack>
        )}
        <Button
          variant="outline"
          borderColor="teal.500"
          color="teal.500"
          size="sm"
          onClick={onOpenMediaUpload}
        >
          + Upload Media
        </Button>
      </Box>

      <Box>
        <HStack
          spacing={2}
          mb={1}
        >
          <Icon
            as={FiEdit3}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            Add a note
          </Heading>
        </HStack>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          Notes
        </Text>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes"
          minH="100px"
        />
      </Box>
    </>
  );
}
