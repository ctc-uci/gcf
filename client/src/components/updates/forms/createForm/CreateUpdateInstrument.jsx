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

import { useTranslation } from 'react-i18next';
import {
  FiCamera,
  FiCornerDownRight,
  FiEdit3,
  FiHelpCircle,
  FiMusic,
  FiStar,
  FiTool,
  FiX,
} from 'react-icons/fi';

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
  needsAdminHelp,
  setNeedsAdminHelp,
  notes,
  setNotes,
}) {
  const { t } = useTranslation();
  return (
    <>
      <Box>
        <HStack
          spacing={2}
          mb={1}
        >
          <Icon
            as={FiMusic}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            {t('updates.whichInstrument')}
          </Heading>
        </HStack>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          {t('updates.selectInstrument')}{' '}
          <Text
            as="span"
            color="red.500"
          >
            {t('common.requiredStar')}
          </Text>
        </Text>
        <Select
          placeholder={t('updates.selectInstrumentPh')}
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
          {t('updates.whatHappened')}
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
                <Text>{t('updates.broken')}</Text>
              </HStack>
            </Radio>
            <Radio value="Missing">
              <HStack spacing={2}>
                <Icon
                  as={FiHelpCircle}
                  boxSize={4}
                />
                <Text>{t('updates.missing')}</Text>
              </HStack>
            </Radio>
            <Radio value="New / Donation">
              <HStack spacing={2}>
                <Icon
                  as={FiCornerDownRight}
                  boxSize={4}
                />
                <Text>{t('updates.newDonation')}</Text>
              </HStack>
            </Radio>
            <Radio value="Needs repair">
              <HStack spacing={2}>
                <Icon
                  as={FiTool}
                  boxSize={4}
                />
                <Text>{t('updates.needsRepair')}</Text>
              </HStack>
            </Radio>
            <Radio value="Other">
              <Text>{t('updates.otherExplain')}</Text>
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
            as={FiMusic}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            {t('updates.howManyAffected')}
          </Heading>
        </HStack>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          {t('updates.numberOfInstruments')}{' '}
          <Text
            as="span"
            color="red.500"
          >
            {t('common.requiredStar')}
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
              {t('common.totalLabel', { name: selectedInstrument })}{' '}
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
            as={FiCamera}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            {t('updates.photosVideosInstrument')}
          </Heading>
        </HStack>
        <Text
          color="teal.500"
          fontSize="sm"
          mb={2}
        >
          {t('updates.photosHelp')}
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
          {t('updates.uploadMedia')}
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
            {t('updates.adminHelpHeading')}
          </Heading>
        </HStack>
        <Checkbox
          isChecked={needsAdminHelp}
          onChange={(e) => setNeedsAdminHelp(e.target.checked)}
          colorScheme="teal"
        >
          {t('updates.specialRequest')}
        </Checkbox>
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
            {t('updates.addNoteHeading')}
          </Heading>
        </HStack>
        <Text
          color="teal.500"
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
