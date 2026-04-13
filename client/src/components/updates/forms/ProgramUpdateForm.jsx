import { useEffect, useRef, useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { useTranslation } from 'react-i18next';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

import { ReviewProgramUpdate } from './ReviewProgramUpdate';

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
  programUpdateId = null,
  isInstrumentUpdate = null,
  selectedUpdate = null,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const disclosure = useDisclosure();
  const confirmDisclosure = useDisclosure();

  const isControlled = onOpenProp !== undefined && onCloseProp !== undefined;
  const isOpen = isControlled ? isOpenProp : disclosure.isOpen;
  const onClose = isControlled ? onCloseProp : disclosure.onClose;
  const btnRef = useRef(null);

  const [, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [programId, setProgramId] = useState('');
  const [, setAvailablePrograms] = useState([]);
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();

  const [title, setTitle] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState(null);
  const [, setGraduatedNumber] = useState(null);
  const [, setEnrollmentChangeId] = useState(null);
  const [notes, setNotes] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [, setUpdateType] = useState('');
  const [programName, setProgramName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [updateDateTime, setUpdateDateTime] = useState('');

  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [quantity, setQuantity] = useState(0);

  const [existingInstruments, setExistingInstruments] = useState([]);
  const [addedInstruments, setAddedInstruments] = useState({});
  const [originalInstruments, setOriginalInstruments] = useState({});
  const [, setNewInstruments] = useState([]);
  const [instrumentChangeMap, setInstrumentChangeMap] = useState({});
  const { backend } = useBackendContext();

  const diffChanges = [
    {
      label: 'Program Name',
      oldValue: selectedUpdate?.name || programName,
      newValue: programName,
    },
    {
      label: 'Instruments & Quantity',
      isTag: true,
      oldTags: Object.entries(originalInstruments || {}).map(
        ([name, qty]) => `${name} ${qty}`
      ),
      newTags: Object.entries(addedInstruments || {}).map(
        ([name, qty]) => `${name} ${qty}`
      ),
    },
    {
      label: 'Current Students',
      oldValue: selectedUpdate?.enrollmentChange,
      newValue: enrollmentNumber,
    },
    {
      label: 'Special Request (Flagged)',
      oldValue: selectedUpdate?.flagged ? 'Yes' : 'No',
      newValue: flagged ? 'Yes' : 'No',
    },
    {
      label: 'Notes',
      oldValue: selectedUpdate?.note,
      newValue: notes,
    },
  ];

  const handleKeepAsUnresolved = async () => {
    setIsSaving(true);
    try {
      await backend.put(`/program-updates/${programUpdateId}`, {
        show_on_table: false,
        note: notes,
        title,
        programId,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndResolveClick = () => {
    confirmDisclosure.onOpen();
  };

  const handleConfirmChanges = async () => {
    setIsSaving(true);
    try {
      await backend.put(`/program-updates/${programUpdateId}`, {
        show_on_table: true,
        note: notes,
        title,
        programId,
      });

      if (isInstrumentUpdate) {
        const instrumentPromises = [];

        for (const [name, originalQty] of Object.entries(originalInstruments)) {
          const newQty = addedInstruments[name];
          const meta = instrumentChangeMap[name];

          if (newQty === undefined) {
            if (meta?.changeId) {
              instrumentPromises.push(
                backend.delete(`/instrument-changes/${meta.changeId}`)
              );
            }
          } else if (newQty !== originalQty) {
            if (meta?.changeId) {
              instrumentPromises.push(
                backend.put(`/instrument-changes/${meta.changeId}`, {
                  amountChanged: newQty,
                })
              );
            }
          }
        }

        for (const [name, newQty] of Object.entries(addedInstruments)) {
          if (originalInstruments[name] === undefined) {
            const instrumentId = existingInstruments.find(
              (i) => i.name === name
            )?.id;

            if (instrumentId) {
              instrumentPromises.push(
                backend.post(`/instrument-changes`, {
                  instrumentId: instrumentId,
                  updateId: programUpdateId,
                  amountChanged: newQty,
                  event_type: 'other',
                })
              );
            }
          }
        }
        await Promise.all(instrumentPromises);
      }
      if (onSuccess) onSuccess();
      confirmDisclosure.onClose();
      onClose();
    } catch (error) {
      console.error('Failed to confirm changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
      setUpdateDateTime('');
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
          const fetchGcfName = async (id) => {
            if (id === null || id === '') return '';
            try {
              const userRes = await backend.get(`/gcf-users/${id}`);
              return (
                [userRes.data?.firstName, userRes.data?.lastName]
                  .filter(Boolean)
                  .join(' ') || ''
              );
            } catch {
              return '';
            }
          };
          try {
            const progRes = await backend.get(`/program/${pid}`);
            resolvedProgramName = progRes.data?.name || '';
            const programCreatorId = progRes.data?.createdBy;
            resolvedAuthorName = await fetchGcfName(programCreatorId);
            if (!resolvedAuthorName && data.createdBy !== null) {
              resolvedAuthorName = await fetchGcfName(data.createdBy);
            }
          } catch (e) {
            console.error('Error fetching program or author:', e);
          }
          setProgramName(resolvedProgramName);
          setAuthorName(resolvedAuthorName);
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

  const drawerSize = isFullScreen ? 'full' : 'lg';
  return (
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
                  <Avatar
                    size="sm"
                    name={authorName || undefined}
                    bg="teal.500"
                    color="white"
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
              <Text
                color="gray.400"
                fontSize="sm"
              >
                {t('updates.noMediaAttached')}
              </Text>
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

        <DrawerFooter
          borderTopWidth="1px"
          borderColor="gray.200"
          justifyContent="flex-end"
          w="full"
          p={4}
        >
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={handleKeepAsUnresolved}
              isLoading={isSaving}
            >
              Keep as Unresolved
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSaveAndResolveClick}
              isDisabled={isSaving}
            >
              Save & Mark as Resolved
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>

      <ReviewProgramUpdate
        isOpen={confirmDisclosure.isOpen}
        onClose={confirmDisclosure.onClose}
        onConfirm={handleConfirmChanges}
        changes={diffChanges}
        isLoading={isSaving}
      />
    </Drawer>
  );
};
