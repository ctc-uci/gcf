import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  SimpleGrid,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { DirectorAvatar } from '@/components/dashboard/ProgramForm/DirectorAvatar';
import { MediaCard } from '@/components/media/MediaCard';
import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { useTranslation } from 'react-i18next';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

import { MediaViewer } from '../MediaViewer';

function formatUpdateDisplayDate(value) {
  if (value === null || value === undefined || value === '') return '';
  const s = String(value).trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (ymd && !/\d{1,2}:\d{2}/.test(s)) {
    const [, y, mo, d] = ymd;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d));
    if (Number.isNaN(dt.getTime())) return s;
    return dt.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return s;
  return dt.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const ProgramUpdateForm = ({
  isOpen: isOpenProp,
  onOpen: onOpenProp,
  onClose: onCloseProp,
  onSave,
  programUpdateId = null,
  isInstrumentUpdate = null,
  selectedUpdate = null,
}) => {
  const { t } = useTranslation();
  const disclosure = useDisclosure();
  const isControlled = onOpenProp !== undefined && onCloseProp !== undefined;
  const isOpen = isControlled ? isOpenProp : disclosure.isOpen;
  const onClose = isControlled ? onCloseProp : disclosure.onClose;
  const btnRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [programId, setProgramId] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();

  const [title, setTitle] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState(null);
  const [graduatedNumber, setGraduatedNumber] = useState(null);
  const [enrollmentChangeId, setEnrollmentChangeId] = useState(null);
  const [notes, setNotes] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [updateType, setUpdateType] = useState('');
  const [programName, setProgramName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorPicture, setAuthorPicture] = useState('');
  const [updateDateTime, setUpdateDateTime] = useState('');

  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [quantity, setQuantity] = useState(0);

  const [existingInstruments, setExistingInstruments] = useState([]);
  const [addedInstruments, setAddedInstruments] = useState({});
  const [originalInstruments, setOriginalInstruments] = useState({});
  const [newInstruments, setNewInstruments] = useState([]);
  const [instrumentChangeMap, setInstrumentChangeMap] = useState({});

  const [mediaItems, setMediaItems] = useState([]);
  const [mediaURLs, setMediaURLs] = useState([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);

  const { backend } = useBackendContext();
  const toast = useToast();

  useEffect(() => {
    if (!programUpdateId) {
      setTitle('');
      setNotes('');
      setProgramId('');
      setEnrollmentNumber(null);
      setGraduatedNumber(null);
      setEnrollmentChangeId(null);
      setAddedInstruments({});
      setOriginalInstruments({});
      setNewInstruments([]);
      setSelectedInstrument('');
      setQuantity(0);
      setFlagged(false);
      setUpdateType('');
      setProgramName('');
      setAuthorName('');
      setAuthorPicture('');
      setUpdateDateTime('');
      setMediaItems([]);
      setMediaURLs([]);
      setSelectedMediaIndex(null);
    }
  }, [programUpdateId]);

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const response = await backend.get('/instruments');
        setExistingInstruments(response.data);
      } catch (error) {
        console.error('Error fetching instruments:', error);
        setExistingInstruments([]);
      }
    };
    fetchInstruments();
  }, [backend]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        let programs = [];
        if (role === 'Program Director') {
          const response = await backend.get(
            `/program-directors/me/${currentUser?.uid}/program`
          );
          programs = response.data ? [response.data] : [];
        } else if (role === 'Regional Director') {
          const response = await backend.get(
            `/regional-directors/${currentUser?.uid}/programs`
          );
          programs = response.data || [];
        } else if (role === 'Admin' || role === 'Super Admin') {
          const response = await backend.get(`/program`);
          programs = response.data || [];
        }
        setAvailablePrograms(programs);
        if (programs.length === 1 && programUpdateId === null) {
          setProgramId(programs[0].id);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
    if (programUpdateId === null && currentUser?.uid && role) {
      fetchPrograms();
    }
  }, [role, currentUser, backend, programUpdateId]);

  useEffect(() => {
    const fetchProgramUpdate = async () => {
      if (programUpdateId === null) return;
      setIsLoading(true);
      if (
        selectedUpdate &&
        String(selectedUpdate.id) === String(programUpdateId)
      ) {
        setProgramName(selectedUpdate.name || '');
        setAuthorName(
          [selectedUpdate.firstName, selectedUpdate.lastName]
            .filter(Boolean)
            .join(' ') || ''
        );
        setAuthorPicture(selectedUpdate.picture || '');
        setUpdateDateTime(selectedUpdate.updateDate || '');
      }
      try {
        const response = await backend.get(
          `/program-updates/${programUpdateId}`
        );
        const data = response.data;
        setTitle(data.title || '');
        setNotes(data.note || '');
        setProgramId(parseInt(data.programId, 10));
        setUpdateDateTime(data.updateDate || '');

        const pid = parseInt(data.programId, 10);
        const listRow =
          selectedUpdate &&
          String(selectedUpdate.id) === String(programUpdateId)
            ? {
                name: selectedUpdate.name || '',
                author: [selectedUpdate.firstName, selectedUpdate.lastName]
                  .filter(Boolean)
                  .join(' '),
              }
            : null;

        if (listRow) {
          setProgramName(listRow.name);
          setAuthorName(listRow.author);
        } else {
          let resolvedProgramName = '';
          let resolvedAuthorName = '';
          let resolvedAuthorPicture = '';
          const fetchGcfUser = async (id) => {
            if (id == null || id === '') return { name: '', picture: '' };
            try {
              const userRes = await backend.get(`/gcf-users/${id}`);
              return {
                name:
                  [userRes.data?.firstName, userRes.data?.lastName]
                    .filter(Boolean)
                    .join(' ') || '',
                picture: userRes.data?.picture || '',
              };
            } catch {
              return { name: '', picture: '' };
            }
          };
          try {
            const progRes = await backend.get(`/program/${pid}`);
            resolvedProgramName = progRes.data?.name || '';
            const programCreatorId = progRes.data?.createdBy;
            const primary = await fetchGcfUser(programCreatorId);
            resolvedAuthorName = primary.name;
            resolvedAuthorPicture = primary.picture;
            if (!resolvedAuthorName && data.createdBy != null) {
              const fallback = await fetchGcfUser(data.createdBy);
              resolvedAuthorName = fallback.name;
              resolvedAuthorPicture = fallback.picture;
            }
          } catch (e) {
            console.error('Error fetching program or author:', e);
          }
          setProgramName(resolvedProgramName);
          setAuthorName(resolvedAuthorName);
          setAuthorPicture(resolvedAuthorPicture);
        }
        setUpdateType(data.updateType || data.title || '');
        setFlagged(data.flagged || false);

        try {
          const enrollmentResponse = await backend.get(
            `/enrollmentChange/update/${programUpdateId}`
          );
          if (enrollmentResponse.data && enrollmentResponse.data.length > 0) {
            const enrollmentData =
              enrollmentResponse.data[enrollmentResponse.data.length - 1];
            setEnrollmentChangeId(enrollmentData.id);
            setEnrollmentNumber(enrollmentData.enrollmentChange || null);
            setGraduatedNumber(enrollmentData.graduatedChange || null);
          }
        } catch (error) {
          console.error('Error fetching enrollment changes:', error);
        }

        try {
          const instrumentChangesResponse = await backend.get(
            `/instrument-changes/update/${programUpdateId}`
          );
          if (
            instrumentChangesResponse.data &&
            instrumentChangesResponse.data.length > 0
          ) {
            const instrumentsMap = {};
            const changeMeta = {};
            for (const change of instrumentChangesResponse.data) {
              const iName = existingInstruments.find(
                (i) => i.id === change.instrumentId
              )?.name;
              if (iName) {
                instrumentsMap[iName] = change.amountChanged;
                changeMeta[iName] = {
                  changeId: change.id,
                  instrumentId: change.instrumentId,
                };
              }
            }
            setAddedInstruments(instrumentsMap);
            setOriginalInstruments(JSON.parse(JSON.stringify(instrumentsMap)));
            setInstrumentChangeMap(changeMeta);

            const photoResults = await Promise.allSettled(
              Object.values(changeMeta).map(({ changeId }) =>
                backend.get(
                  `/instrument-change-photos/instrument-change/${changeId}`
                )
              )
            );
            const mediaData = photoResults
              .filter((r) => r.status === 'fulfilled')
              .flatMap((r) => r.value.data || []);

            const urlResults = await Promise.allSettled(
              mediaData.map((m) => backend.get(`/images/url/${m.s3Key}`))
            );
            const validItems = mediaData.filter(
              (_, i) => urlResults[i].status === 'fulfilled'
            );
            const validURLs = urlResults
              .filter((r) => r.status === 'fulfilled')
              .map((r) => r.value.data.url);
            setMediaItems(validItems);
            setMediaURLs(validURLs);
          }
        } catch (error) {
          console.error('Error fetching instrument changes:', error);
        }
      } catch (error) {
        console.error('Error fetching program update:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgramUpdate();
  }, [programUpdateId, existingInstruments, backend, selectedUpdate]);

  const removeInstrument = (name) => {
    setAddedInstruments((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    setNewInstruments((prev) => prev.filter((n) => n !== name));
  };

  const handleConfirmAddInstrument = () => {
    if (!selectedInstrument && !newInstrumentName) return;
    if (quantity === 0) return;
    if (selectedInstrument && newInstrumentName) return;

    if (newInstrumentName) {
      setNewInstruments((prev) => [...prev, newInstrumentName]);
    }
    setAddedInstruments((prev) => ({
      ...prev,
      [selectedInstrument || newInstrumentName]: parseInt(quantity),
    }));
    setNewInstrumentName('');
    setSelectedInstrument('');
    setQuantity(0);
  };

  const handleSubmit = async (markResolved = false) => {
    setIsLoading(true);
    try {
      const programUpdateData = {
        title: title ? String(title).trim() : null,
        program_id: parseInt(programId, 10) || null,
        created_by: currentUser?.uid,
        update_date: new Date().toISOString(),
        note: notes ? String(notes).trim() : null,
      };

      let updatedProgramUpdateId = programUpdateId;

      if (programUpdateId) {
        await backend.put(
          `/program-updates/${programUpdateId}`,
          programUpdateData
        );
      } else {
        const response = await backend.post(
          '/program-updates',
          programUpdateData
        );
        updatedProgramUpdateId = response.data.id;
      }

      // Handle new instruments
      for (const iName of newInstruments) {
        try {
          await backend.post('/instruments', { name: iName });
        } catch (error) {
          console.error(`Error adding instrument ${iName}:`, error);
        }
      }

      const instrumentsResponse = await backend.get('/instruments');
      setExistingInstruments(instrumentsResponse.data);

      // Handle deleted instruments
      const deletedInstruments = Object.keys(originalInstruments).filter(
        (name) => !addedInstruments[name]
      );
      for (const deletedName of deletedInstruments) {
        const changeMeta = instrumentChangeMap[deletedName];
        if (changeMeta?.changeId) {
          await backend.delete(`/instrument-changes/${changeMeta.changeId}`);
        }
      }

      // Handle added/updated instruments
      if (Object.keys(addedInstruments).length > 0) {
        for (const [name, qty] of Object.entries(addedInstruments)) {
          const meta = instrumentChangeMap[name];
          if (meta?.changeId) {
            if (originalInstruments[name] !== qty) {
              await backend.put(`/instrument-changes/${meta.changeId}`, {
                instrumentId: meta.instrumentId,
                updateId: updatedProgramUpdateId,
                amountChanged: qty,
              });
            }
          } else {
            const instrument = instrumentsResponse.data.find(
              (i) => i.name === name
            );
            if (instrument) {
              await backend.post('/instrument-changes', {
                instrumentId: instrument.id,
                updateId: updatedProgramUpdateId,
                amountChanged: qty,
              });
            }
          }
        }
      }

      if (isInstrumentUpdate && updatedProgramUpdateId) {
        const { data: rowsForThisProgramUpdate = [] } = await backend.get(
          `/instrument-changes/update/${updatedProgramUpdateId}`
        );
        for (const row of rowsForThisProgramUpdate) {
          await backend.put(`/instrument-changes/${row.id}`, {
            special_request: flagged,
          });
        }
      }

      // Handle enrollment
      if (enrollmentNumber !== null) {
        if (enrollmentChangeId) {
          await backend.put(`/enrollmentChange/${enrollmentChangeId}`, {
            update_id: updatedProgramUpdateId,
            enrollment_change: enrollmentNumber,
            graduated_change: graduatedNumber || 0,
          });
        } else {
          const enrollmentResponse = await backend.post('/enrollmentChange', {
            update_id: updatedProgramUpdateId,
            enrollment_change: enrollmentNumber,
            graduated_change: graduatedNumber || 0,
          });
          setEnrollmentChangeId(enrollmentResponse.data.id);
        }
      }

      toast({
        title: programUpdateId
          ? t('updates.savedTitle')
          : t('updates.createdTitleToast'),
        description: programUpdateId
          ? t('updates.savedDesc')
          : t('updates.programUpdateCreatedDesc'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error submitting program update:', error);
      toast({
        title: t('updates.failedSaveTitle'),
        description:
          error?.response?.data?.message ??
          error?.message ??
          t('updates.failedSaveDesc'),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const drawerSize = isFullScreen ? 'full' : 'lg';
  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size={drawerSize}
      >
        <DrawerOverlay />
        <DrawerContent maxW={isFullScreen ? '100%' : '50%'}>
          <Flex
            position="absolute"
            top={3}
            left={3}
            zIndex={1}
          >
            <IconButton
              icon={isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
              aria-label={
                isFullScreen
                  ? t('fullscreenFlyout.minimize')
                  : t('fullscreenFlyout.expand')
              }
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreen(!isFullScreen)}
            />
          </Flex>

          <Box
            pt={6}
            pb={2}
            px={8}
          >
            <Text
              fontSize="xl"
              fontWeight="600"
              textAlign="center"
            >
              {t('updates.programUpdateTitle')}
            </Text>
            <Divider mt={3} />
          </Box>

          <DrawerBody
            px={8}
            pb={24}
          >
            <VStack
              spacing={6}
              align="stretch"
            >
              <Heading
                size="md"
                mt={4}
              >
                {t('updates.updateInformation')}
              </Heading>

              <Grid
                templateColumns="repeat(3, 1fr)"
                gap={6}
              >
                <GridItem>
                  <Text
                    color="teal.500"
                    fontSize="sm"
                    fontWeight="500"
                    mb={1}
                  >
                    {t('updates.colAuthor')}
                  </Text>
                  <HStack spacing={3}>
                    <DirectorAvatar
                      picture={authorPicture}
                      name={authorName || ''}
                      boxSize="32px"
                    />
                    <Text>{authorName || t('common.emDash')}</Text>
                  </HStack>
                </GridItem>
                <GridItem>
                  <Text
                    color="teal.500"
                    fontSize="sm"
                    fontWeight="500"
                    mb={1}
                  >
                    {t('updates.colProgram')}
                  </Text>
                  <Text fontWeight="500">
                    {programName || t('common.emDash')}
                  </Text>
                </GridItem>
                <GridItem>
                  <Text
                    color="teal.500"
                    fontSize="sm"
                    fontWeight="500"
                    mb={1}
                  >
                    {t('common.time')}
                  </Text>
                  <Text>
                    {formatUpdateDisplayDate(updateDateTime) ||
                      t('common.emDash')}
                  </Text>
                </GridItem>
              </Grid>
              {isInstrumentUpdate && (
                <Box>
                  <Text
                    color="teal.500"
                    fontSize="sm"
                    fontWeight="500"
                    mb={2}
                  >
                    {t('updates.flagLabel')}
                  </Text>
                  <Checkbox
                    isChecked={flagged}
                    onChange={(e) => setFlagged(e.target.checked)}
                  >
                    {t('updates.specialRequest')}
                  </Checkbox>
                </Box>
              )}
              <Grid
                templateColumns="repeat(3, 1fr)"
                gap={6}
              >
                <GridItem>
                  <Text
                    color="teal.500"
                    fontSize="sm"
                    fontWeight="500"
                    mb={1}
                  >
                    {t('updates.updateType')}
                  </Text>
                  <Text>
                    {isInstrumentUpdate
                      ? t('updates.typeInstrument')
                      : t('updates.typeStudent')}
                  </Text>
                </GridItem>
              </Grid>

              <Box>
                <Text
                  color="teal.500"
                  fontSize="sm"
                  fontWeight="500"
                  mb={2}
                >
                  {t('updates.photosVideos')}
                </Text>
                {mediaItems.length > 0 ? (
                  <SimpleGrid
                    columns={{ base: 2, md: 3, lg: 4 }}
                    spacing={4}
                  >
                    {mediaItems.map((item, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setSelectedMediaIndex(idx)}
                        cursor="pointer"
                        borderRadius="md"
                      >
                        <Box
                          position="relative"
                          borderRadius="md"
                          overflow="hidden"
                          bg="gray.100"
                        >
                          <MediaCard
                            file_name={item.fileName}
                            file_type={item.fileType}
                            imageUrl={mediaURLs[idx]}
                          />
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text
                    color="gray.400"
                    fontSize="sm"
                  >
                    {t('updates.noMediaAttached')}
                  </Text>
                )}
              </Box>

              <Box>
                <Text
                  color="teal.500"
                  fontSize="sm"
                  fontWeight="500"
                  mb={2}
                >
                  {t('common.note')}
                </Text>
                <Text>{notes || ''}</Text>
              </Box>

              <Divider />
              {isInstrumentUpdate && (
                <Box>
                  <Heading size="md">{t('updates.editUpdate')}</Heading>

                  <Box>
                    <Text
                      color="teal.500"
                      fontSize="sm"
                      fontWeight="500"
                      mb={2}
                    >
                      {t('updates.instrumentQuantity')}
                    </Text>
                    <HStack
                      wrap="wrap"
                      spacing={2}
                      mb={3}
                    >
                      {Object.entries(addedInstruments).map(([name, qty]) => (
                        <Tag
                          key={name}
                          size="lg"
                          borderRadius="md"
                          variant="outline"
                        >
                          <TagLabel>
                            {name} {qty}
                          </TagLabel>
                          <TagCloseButton
                            onClick={() => removeInstrument(name)}
                          />
                        </Tag>
                      ))}
                    </HStack>
                    <HStack spacing={2}>
                      <Select
                        placeholder={t('updates.selectInstrumentPh')}
                        value={selectedInstrument}
                        onChange={(e) => setSelectedInstrument(e.target.value)}
                        size="sm"
                        maxW="200px"
                      >
                        {existingInstruments.map((instrument) => (
                          <option
                            key={instrument.id}
                            value={instrument.name}
                          >
                            {instrument.name}
                          </option>
                        ))}
                      </Select>
                      <NumberInput
                        step={1}
                        min={0}
                        width="80px"
                        value={quantity}
                        onChange={(v) => setQuantity(Number(v))}
                        size="sm"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleConfirmAddInstrument}
                      >
                        {t('common.add')}
                      </Button>
                    </HStack>
                  </Box>
                </Box>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      {selectedMediaIndex !== null && (
        <MediaViewer
          updates={mediaItems}
          mediaURLs={mediaURLs}
          selectedIndex={selectedMediaIndex}
          onClose={() => setSelectedMediaIndex(null)}
        />
      )}
    </>
  );
};
