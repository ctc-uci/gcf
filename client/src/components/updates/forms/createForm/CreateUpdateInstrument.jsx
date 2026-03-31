import { useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  CloseButton,
  Heading,
  HStack,
  Icon,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import { BsMusicNoteList, BsPencilSquare } from 'react-icons/bs';
import { FaScrewdriverWrench } from 'react-icons/fa6';
import { FiStar, FiX } from 'react-icons/fi';
import { IoIosMusicalNotes, IoMdPhotos } from 'react-icons/io';
import { MdQuestionMark } from 'react-icons/md';

export default function CreateUpdateInstrument({
  selectedInstrument,
  setSelectedInstrument,
  whatHappened,
  setWhatHappened,
  instrumentCount,
  setInstrumentCount,
  programInstrumentCountForSelected,
  instruments,
  uploadedMedia,
  removeMedia,
  mediaUploadDisclosure,
  notes,
  setNotes,
}) {
  const [needsAdminHelp, setNeedsAdminHelp] = useState(false);

  return (
    <>
      <Box>
        <HStack
          spacing={2}
          mb={1}
        >
          <Icon
            as={IoIosMusicalNotes}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            Which instrument is this update about?
          </Heading>
        </HStack>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          Select instrument{' '}
          <Text
            as="span"
            color="red.500"
          >
            *
          </Text>
        </Text>
        <Select
          placeholder="Select Instrument"
          value={selectedInstrument}
          onChange={(e) => setSelectedInstrument(e.target.value)}
        >
          {(instruments || []).map((inst) => (
            <option
              key={inst.id}
              value={inst.name}
            >
              {inst.name}
            </option>
          ))}
        </Select>
      </Box>

      <Box>
        <Heading
          size="sm"
          fontWeight="600"
          mb={3}
        >
          What happened to this instrument?
        </Heading>
        <RadioGroup
          value={whatHappened}
          onChange={setWhatHappened}
        >
          <VStack
            align="start"
            spacing={2}
          >
            <Radio value="Broken">
              <HStack spacing={2}>
                <Icon
                  as={FiX}
                  boxSize={4}
                />
                <Text>Broken</Text>
              </HStack>
            </Radio>
            <Radio value="Missing">
              <HStack spacing={2}>
                <Icon
                  as={MdQuestionMark}
                  boxSize={4}
                />
                <Text>Missing</Text>
              </HStack>
            </Radio>
            <Radio value="New / Donation">
              <HStack spacing={2}>
                <Icon
                  as={BsMusicNoteList}
                  boxSize={4}
                />
                <Text>New / Donation</Text>
              </HStack>
            </Radio>
            <Radio value="Needs repair">
              <HStack spacing={2}>
                <Icon
                  as={FaScrewdriverWrench}
                  boxSize={4}
                />
                <Text>Needs repair</Text>
              </HStack>
            </Radio>
            <Radio value="Other">
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
            as={IoIosMusicalNotes}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            How many instruments are affected?
          </Heading>
        </HStack>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          Number of instruments{' '}
          <Text
            as="span"
            color="red.500"
          >
            *
          </Text>
        </Text>
        <NumberInput
          min={0}
          value={instrumentCount}
          onChange={(v) => setInstrumentCount(parseInt(v, 10) || 0)}
        >
          <NumberInputField />
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
          {programInstrumentCountForSelected === null ? (
            ''
          ) : (
            <>
              Total {selectedInstrument}:{' '}
              <Text
                as="span"
                fontWeight="bold"
              >
                {programInstrumentCountForSelected}
              </Text>
            </>
          )}
        </Text>
      </Box>

      <Box>
        <HStack
          spacing={2}
          mb={1}
        >
          <Icon
            as={IoMdPhotos}
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
          This helps us understand the issue.
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
                {media.file_type?.startsWith('image/') ? (
                  <Image
                    src={media.previewUrl || ''}
                    alt={media.file_name}
                    boxSize="80px"
                    objectFit="cover"
                    borderRadius="md"
                    bg="gray.100"
                  />
                ) : (
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
                )}
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
                <Text
                  fontSize="xs"
                  noOfLines={1}
                  maxW="80px"
                >
                  {media.file_name}
                </Text>
              </Box>
            ))}
          </HStack>
        )}
        <Button
          variant="outline"
          borderColor="teal.500"
          color="teal.500"
          size="sm"
          onClick={mediaUploadDisclosure.onOpen}
        >
          + Upload Media
        </Button>
      </Box>

      <Box>
        <HStack
          spacing={2}
          mb={2}
        >
          <Icon
            as={FiStar}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            Do you need admin help or approval for this?
          </Heading>
        </HStack>
        <Checkbox
          isChecked={needsAdminHelp}
          onChange={(e) => setNeedsAdminHelp(e.target.checked)}
          colorScheme="teal"
        >
          Yes, this is a special request
        </Checkbox>
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
