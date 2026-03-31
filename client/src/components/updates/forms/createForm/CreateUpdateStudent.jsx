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
  Text,
  Textarea,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { FiCamera, FiEdit3, FiUsers } from 'react-icons/fi';

export default function CreateUpdateStudent({
  studentCount,
  setStudentCount,
  uploadedMedia,
  removeMedia,
  onOpenMediaUpload,
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
            as={FiUsers}
            boxSize={4}
          />
          <Heading
            size="sm"
            fontWeight="600"
          >
            {t('updates.createStudentHeading')}
          </Heading>
        </HStack>
        <Text
          color="teal.500"
          fontSize="sm"
          fontWeight="500"
          mb={1}
        >
          {t('updates.numberOfStudents')}{' '}
          <Text
            as="span"
            color="red.500"
          >
            {t('common.requiredStar')}
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
            {t('updates.photosVideosStudent')}
          </Heading>
        </HStack>
        <Text
          color="teal.500"
          fontSize="sm"
          mb={2}
        >
          {t('common.optional')}
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
          {t('updates.uploadMedia')}
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
