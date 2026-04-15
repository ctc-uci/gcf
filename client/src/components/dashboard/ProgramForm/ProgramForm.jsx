import { useEffect, useMemo, useRef, useState } from 'react';

import { DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { MediaUploadModal } from '@/components/media/MediaUploadModal';
import { PartnerOrganizationField } from '@/components/partners/PartnerOrganizationField';
import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import ISO6391 from 'iso-639-1';
import { useTranslation } from 'react-i18next';

import { AssignedDirectorsSection } from './AssignedDirectorsSection';
import { LocationLanguageSection } from './LocationLanguageSection';
import { MediaPreviewTag } from './MediaPreviewTag';
import { ResourcesSection } from './ResourcesSection';
import { StudentsInstrumentsSection } from './StudentsInstrumentsSection';

/**
 * Deletes all `instrument_change` rows for this program + instrument using
 * existing routes (same DELETE as ProgramUpdateForm). Sweeps every
 * program_update for the program.
 */
async function deleteInstrumentChangesForProgramInstrument(
  backend,
  programId,
  instrumentId
) {
  const numericProgramId = Number(programId);
  const numericInstrumentId = Number(instrumentId);
  if (Number.isNaN(numericInstrumentId)) return;

  const res = await backend.get('/program-updates');
  const updates = Array.isArray(res.data) ? res.data : [];
  const updateIds = updates
    .filter((u) => Number(u.programId ?? u.program_id) === numericProgramId)
    .map((u) => u.id);

  for (const updateId of updateIds) {
    const icRes = await backend.get(`/instrument-changes/update/${updateId}`);
    const rows = Array.isArray(icRes.data) ? icRes.data : [];
    for (const row of rows) {
      const iid = Number(row.instrumentId ?? row.instrument_id);
      if (
        iid === numericInstrumentId &&
        row.id !== null &&
        row.id !== undefined
      ) {
        await backend.delete(`/instrument-changes/${row.id}`);
      }
    }
  }
}

export const ProgramForm = ({
  isOpen: isOpenProp,
  onOpen: onOpenProp,
  onClose: onCloseProp,
  onSave,
  program,
}) => {
  const { t } = useTranslation();
  const disclosure = useDisclosure();
  const mediaUploadModal = useDisclosure();

  const isControlled = onOpenProp !== undefined && onCloseProp !== undefined;
  const isOpen = isControlled ? isOpenProp : disclosure.isOpen;
  const onClose = isControlled ? onCloseProp : disclosure.onClose;
  const btnRef = useRef(null);
  const { backend } = useBackendContext();
  const { currentUser } = useAuthContext();

  const deleteDisclosure = useDisclosure();

  const [initialProgramDirectorIds, setInitialProgramDirectorIds] = useState(
    []
  );
  const [initialInstrumentQuantities, setInitialInstrumentQuantities] =
    useState({});
  const [initialCurriculumLinks, setInitialCurriculumLinks] = useState([]);

  const [, setInitialUploadedMedia] = useState([]);
  const [initialGraduated, setInitialGraduated] = useState(0);

  const [formState, setFormState] = useState({
    status: null,
    programName: null,
    partnerOrg: null,
    showPartnerOrgOnMap: false,
    launchDate: null,
    regionId: null,
    country: null,
    countryIsoCode: null,
    city: null,
    state: null,
    students: 0,
    graduatedStudents: 0,
    instruments: {},
    languages: [],
    programDirectors: [],
    curriculumLinks: [],
    media: [],
  });
  const languageOptions = useMemo(
    () =>
      ISO6391.getAllCodes()
        .map((code) => ({
          value: code.toLowerCase(),
          label: ISO6391.getName(code),
        }))
        .filter((option) => option.label)
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingProgramData, setIsLoadingProgramData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProgramRegionData() {
      if (!program) {
        setIsLoadingProgramData(false);
        setFormState({
          status: null,
          programName: null,
          partnerOrg: null,
          showPartnerOrgOnMap: false,
          launchDate: null,
          regionId: null,
          country: null,
          countryIsoCode: null,
          state: null,
          city: null,
          students: 0,
          graduatedStudents: 0,
          instruments: {},
          languages: [],
          programDirectors: [],
          curriculumLinks: [],
          media: [],
        });
        setInitialProgramDirectorIds([]);
        setInitialInstrumentQuantities({});
        setInitialCurriculumLinks([]);
        setInitialUploadedMedia([]);
        setInitialGraduated(0);
        return;
      }

      setIsLoadingProgramData(true);

      let record = program;
      try {
        const { data } = await backend.get(`/program/${program.id}`);
        record = {
          ...program,
          ...data,
          programDirectors: program.programDirectors ?? [],
          regionalDirectors: program.regionalDirectors ?? [],
          playlists: program.playlists ?? [],
          media: program.media ?? [],
        };
      } catch (err) {
        console.error('ProgramForm: could not load program details', err);
      }

      try {
        const pdRes = await backend.get(
          `/program/${program.id}/program-directors`
        );
        if (Array.isArray(pdRes.data)) {
          record = { ...record, programDirectors: pdRes.data };
        }
      } catch (err) {
        console.error('ProgramForm: could not load program directors', err);
      }

      let regionId = null;
      let countryIsoCode = null;

      if (record.country) {
        try {
          const countryResponse = await backend.get(
            `/country/${record.country}`
          );
          regionId = countryResponse.data.regionId;
          const rawIso =
            countryResponse.data.isoCode ?? countryResponse.data.iso_code;
          if (
            rawIso !== null &&
            rawIso !== undefined &&
            String(rawIso).trim() !== ''
          ) {
            countryIsoCode = String(rawIso).trim().toUpperCase();
          }
        } catch (error) {
          console.error('error fetching country/region', error);
        }
      }

      const mappedProgramDirectors = (record.programDirectors ?? []).map(
        (d) => ({
          userId: d.userId ?? d.id ?? d.user_id,
          firstName: d.firstName,
          lastName: d.lastName,
          picture: d.picture,
        })
      );
      const programDirectorsForForm = mappedProgramDirectors.slice(0, 1);

      const instrumentMap = {};
      const initialInstrumentMap = {};
      try {
        const instrumentsResponse = await backend.get(
          `/program/${record.id}/instruments`
        );
        const instruments = instrumentsResponse.data || [];
        instruments.forEach((inst) => {
          const id = inst.instrumentId ?? inst.id;
          if (!id) return;
          const qty = inst.quantity ?? 0;
          if (qty === 0) return;
          instrumentMap[id] = {
            id,
            name: inst.name,
            quantity: qty,
          };
          initialInstrumentMap[id] = qty;
        });
      } catch (err) {
        console.error('Error fetching program instruments:', err);
      }

      const normalizedLanguages = (() => {
        if (Array.isArray(record.languages)) {
          return [
            ...new Set(
              record.languages
                .map((value) => String(value).trim().toLowerCase())
                .filter((value) => ISO6391.validate(value))
            ),
          ];
        }
        const existingValue = record.primaryLanguage;
        if (!existingValue) return [];
        const trimmedValue = String(existingValue).trim();
        if (ISO6391.validate(trimmedValue.toLowerCase())) {
          return [trimmedValue.toLowerCase()];
        }
        const mappedCode = ISO6391.getCode(trimmedValue);
        return mappedCode ? [mappedCode.toLowerCase()] : [];
      })();

      let graduatedTotal = 0;
      let sumEnrollment = 0;
      try {
        const aggRes = await backend.get(
          `/program/${record.id}/enrollment-aggregates`
        );
        graduatedTotal = Number(aggRes.data?.sumGraduated ?? 0);
        sumEnrollment = Number(aggRes.data?.sumEnrollment ?? 0);
      } catch (error) {
        console.error('Error fetching enrollment aggregates:', error);
      }
      if (Number.isNaN(graduatedTotal)) graduatedTotal = 0;
      if (Number.isNaN(sumEnrollment)) sumEnrollment = 0;
      setInitialGraduated(graduatedTotal);

      const netStudentsFromAgg = sumEnrollment - graduatedTotal;
      const resolvedStudents =
        record.students !== null && record.students !== undefined
          ? Number(record.students)
          : netStudentsFromAgg;

      setFormState({
        status: record.status ?? null,
        programName: record.title ?? '',
        partnerOrg: record.partnerOrg ?? record.partner_org ?? null,
        showPartnerOrgOnMap:
          record.showPartnerOrgOnMap ?? record.show_partner_org_on_map ?? false,
        launchDate: record.launchDate ? record.launchDate.split('T')[0] : '',
        regionId: regionId,
        state: record.state ?? null,
        city:
          record.city !== null &&
          record.city !== undefined &&
          record.city !== ''
            ? Number(record.city)
            : null,
        country: record.country ?? null,
        countryIsoCode,
        students: Number.isNaN(resolvedStudents) ? 0 : resolvedStudents,
        graduatedStudents: graduatedTotal,
        instruments: instrumentMap,
        languages: normalizedLanguages,

        programDirectors: programDirectorsForForm,

        curriculumLinks: Array.isArray(record.playlists)
          ? record.playlists
              .filter(
                (p) =>
                  p.link &&
                  ((p.instrumentId !== null && p.instrumentId !== undefined) ||
                    (p.instrument_id !== null && p.instrument_id !== undefined))
              )
              .map((p) => ({
                link: p.link,
                name: p.name || 'Playlist',
                instrumentId: p.instrumentId ?? p.instrument_id,
                instrumentName: p.instrumentName ?? p.instrument_name ?? '',
              }))
          : [],

        media: Array.isArray(record.media)
          ? record.media.map((m) => ({
              id: m.id,
              s3_key: m.s3_key,
              file_name: m.file_name,
              file_type: m.file_type,
            }))
          : [],
      });

      setInitialProgramDirectorIds(
        mappedProgramDirectors.map((d) => d.userId).filter(Boolean)
      );
      setInitialInstrumentQuantities(initialInstrumentMap);
      setInitialCurriculumLinks(
        (record.playlists ?? [])
          .filter(
            (p) =>
              p.link &&
              ((p.instrumentId !== null && p.instrumentId !== undefined) ||
                (p.instrument_id !== null && p.instrument_id !== undefined))
          )
          .map((p) => ({
            link: p.link,
            instrumentId: p.instrumentId ?? p.instrument_id,
          }))
      );

      setInitialUploadedMedia(
        (record.media ?? []).filter((m) => m.file_name).map((m) => m.file_name)
      );
    }

    (async () => {
      try {
        await loadProgramRegionData();
      } finally {
        if (!cancelled) {
          setIsLoadingProgramData(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [program, backend]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  function handleProgramStatusChange(status) {
    setFormState((prev) => ({ ...prev, status: status || null }));
  }

  function handleProgramNameChange(name) {
    setFormState((prev) => ({ ...prev, programName: name }));
  }

  function handleProgramLaunchDateChange(date) {
    setFormState((prev) => ({ ...prev, launchDate: date }));
  }

  function handleLanguageChange(languageChanges) {
    setFormState((prev) => ({ ...prev, languages: languageChanges }));
  }

  const handleMediaChange = (newMediaFiles) => {
    setFormState((prev) => ({
      ...prev,
      media: [...(prev.media ?? []), ...newMediaFiles],
    }));
  };

  async function handleSave() {
    try {
      const rawPartner = formState.partnerOrg;
      const hasPartnerOrg =
        rawPartner !== null && rawPartner !== undefined && rawPartner !== '';
      const partnerOrgPayload = hasPartnerOrg
        ? Number(rawPartner)
        : program
          ? null
          : 1;

      const data = {
        name: formState.programName,
        title: formState.programName,
        status: formState.status,
        launchDate: formState.launchDate,
        country: formState.country,
        state: formState.state,
        city: formState.city,
        students: formState.students ?? 0,
        languages: formState.languages ?? [],
        partnerOrg: partnerOrgPayload,
        createdBy: currentUser?.uid || currentUser?.id,
        description: '',
      };

      let programId;
      const oldStudentCount = program?.students || 0;
      const deltaNet = (formState.students ?? 0) - oldStudentCount;
      const deltaGrad = (formState.graduatedStudents ?? 0) - initialGraduated;
      const enrollmentDelta = deltaNet + deltaGrad;
      const graduatedDelta = deltaGrad;

      if (program) {
        await backend.put(`/program/${program.id}`, data);
        programId = program.id;
      } else {
        const response = await backend.post(`/program`, data);
        programId = response.data.id;
      }

      const selectedDirector = formState.programDirectors[0];
      const selectedRaw = selectedDirector?.userId;
      const selectedKey =
        selectedRaw !== null &&
        selectedRaw !== undefined &&
        String(selectedRaw).trim() !== ''
          ? String(selectedRaw).trim()
          : '';
      const validSelected = selectedKey !== '';

      const initialIds = initialProgramDirectorIds || [];
      const initialKeySet = new Set(
        initialIds.map((id) =>
          id !== null && id !== undefined ? String(id).trim() : ''
        )
      );

      if (validSelected) {
        for (const uid of initialIds) {
          if (String(uid).trim() === selectedKey) continue;
          await backend.delete(
            `/program-directors/${encodeURIComponent(String(uid))}`,
            {
              params: { programId },
            }
          );
        }
        if (!initialKeySet.has(selectedKey)) {
          await backend.post(`/program-directors`, {
            userId: selectedRaw,
            programId,
          });
        }
        setInitialProgramDirectorIds([selectedRaw]);
      } else {
        for (const uid of initialIds) {
          await backend.delete(
            `/program-directors/${encodeURIComponent(String(uid))}`,
            {
              params: { programId },
            }
          );
        }
        setInitialProgramDirectorIds([]);
      }

      const currentLinkKeys = (formState.curriculumLinks ?? []).map(
        (p) => `${p.link}\0${p.instrumentId}`
      );
      for (const playlist of formState.curriculumLinks ?? []) {
        const key = `${playlist.link}\0${playlist.instrumentId}`;
        if (
          !initialCurriculumLinks.some(
            (i) => `${i.link}\0${i.instrumentId}` === key
          )
        ) {
          await backend.post(`/program/${programId}/playlists`, {
            link: playlist.link,
            name: playlist.name || 'Playlist',
            instrumentId: playlist.instrumentId,
          });
        }
      }
      for (const old of initialCurriculumLinks) {
        if (!currentLinkKeys.includes(`${old.link}\0${old.instrumentId}`)) {
          await backend.delete(`/program/${programId}/playlists`, {
            data: { link: old.link, instrumentId: old.instrumentId },
          });
        }
      }

      const currentMediaIds = formState.media
        .map((m) => m.id)
        .filter((id) => id !== undefined);
      if (program) {
        const programMedia = program?.media ?? [];
        const mediaToDelete = programMedia.filter(
          (oldMedia) => !currentMediaIds.includes(oldMedia.id)
        );

        for (const media of mediaToDelete) {
          if (media.id) {
            await backend.delete(`/mediaChange/${media.id}`);
          }
        }
      }
      const mediaChanges = formState.media.filter((mediaItem) => !mediaItem.id);

      const instrumentChanges = [];
      const instrumentIdsToPurge = [];

      const allInstrumentIds = new Set([
        ...Object.keys(initialInstrumentQuantities || {}),
        ...Object.keys(formState.instruments || {}),
      ]);

      for (const id of allInstrumentIds) {
        const newQty = formState.instruments?.[id]?.quantity ?? 0;
        const oldQty = initialInstrumentQuantities?.[id] ?? 0;
        if (program && newQty === 0 && oldQty > 0) {
          instrumentIdsToPurge.push(Number(id));
          continue;
        }
        const instrumentDiff = newQty - oldQty;
        if (instrumentDiff !== 0) {
          instrumentChanges.push({
            instrumentId: Number(id),
            amountChanged: instrumentDiff,
          });
        }
      }

      if (program && instrumentIdsToPurge.length > 0) {
        for (const instId of instrumentIdsToPurge) {
          await deleteInstrumentChangesForProgramInstrument(
            backend,
            programId,
            instId
          );
        }
      }

      const hasStudentChange = enrollmentDelta !== 0 || graduatedDelta !== 0;
      const hasInstrumentChange = instrumentChanges.length > 0;
      const hasMediaChange = mediaChanges.length > 0;

      const isNewProgram = !program;

      if (
        isNewProgram ||
        hasStudentChange ||
        hasInstrumentChange ||
        hasMediaChange
      ) {
        const updateResponse = await backend.post(`/program-updates`, {
          title: isNewProgram ? 'Program Created' : 'update program stats',
          program_id: programId,
          created_by: currentUser?.uid || currentUser?.id,
          update_date: new Date().toISOString(),
          note: isNewProgram ? 'Program Created' : 'Program update',
          show_on_table: isNewProgram,
        });

        const updateId = updateResponse.data.id;

        if (hasStudentChange) {
          await backend.post(`/enrollmentChange`, {
            update_id: updateId,
            enrollment_change: enrollmentDelta,
            graduated_change: graduatedDelta,
            event_type: 'other',
          });
        }

        if (hasInstrumentChange) {
          for (const instrumentChange of instrumentChanges) {
            await backend.post(`/instrument-changes`, {
              instrumentId: instrumentChange.instrumentId,
              updateId,
              amountChanged: instrumentChange.amountChanged,
              event_type: 'other',
            });
          }
        }

        if (hasMediaChange) {
          for (const mediaChange of mediaChanges) {
            await backend.post(`/mediaChange`, {
              update_id: updateId,
              s3_key: mediaChange.s3_key,
              file_name: mediaChange.file_name,
              file_type: mediaChange.file_type,
              is_thumbnail: false,
            });
          }
        }
      }

      onSave?.();
      onClose();
    } catch (err) {
      console.error('Error saving program:', err);
    }
  }

  async function handleDelete() {
    if (!program?.id) return;

    try {
      await backend.delete(`/program/${program.id}`);

      deleteDisclosure.onClose();
      onSave?.();
      onClose();
    } catch (err) {
      console.error('Error deleting program:', err);
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={btnRef}
      size="lg"
    >
      <DrawerOverlay />
      <DrawerContent
        position="relative"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        <HStack marginBottom="1em">
          <DrawerCloseButton
            left="4"
            right="auto"
          />
        </HStack>

        <DrawerBody pb={8}>
          <VStack
            spacing={4}
            align="stretch"
            marginLeft="1em"
          >
            <DrawerHeader
              padding="0 0"
              textAlign="center"
              w="full"
            >
              {t('programForm.drawerTitle')}
            </DrawerHeader>
            <HStack
              w="full"
              spacing={0}
              mb={4}
            >
              <Button
                flex={1}
                variant="ghost"
                borderRadius={0}
                onClick={() => setActiveTab('overview')}
                color={activeTab === 'overview' ? 'teal.500' : 'gray.600'}
                borderBottom="2px solid"
                borderColor={activeTab === 'overview' ? 'teal.500' : 'gray.200'}
                _hover={{ bg: 'gray.50' }}
              >
                {t('programForm.overview')}
              </Button>

              <Button
                flex={1}
                variant="ghost"
                borderRadius={0}
                onClick={() => setActiveTab('media')}
                color={activeTab === 'media' ? 'teal.500' : 'gray.600'}
                borderBottom="2px solid"
                borderColor={activeTab === 'media' ? 'teal.500' : 'gray.200'}
                _hover={{ bg: 'gray.50' }}
              >
                {t('programForm.mediaTab')}
              </Button>
            </HStack>
            {activeTab === 'overview' && (
              <>
                <Box>
                  <Heading
                    size="md"
                    fontWeight="semibold"
                    mb={3}
                  >
                    {t('programForm.generalInformation')}
                  </Heading>
                  <VStack
                    align="stretch"
                    spacing={4}
                  >
                    <FormControl isRequired>
                      <FormLabel
                        size="sm"
                        fontWeight="normal"
                        color="gray"
                      >
                        {t('programForm.programName')}
                      </FormLabel>
                      <Input
                        placeholder={t('programForm.enterProgramTitle')}
                        value={formState.programName || ''}
                        onChange={(e) =>
                          handleProgramNameChange(e.target.value)
                        }
                      />
                    </FormControl>

                    <PartnerOrganizationField
                      label={t('programForm.partnerOrgName')}
                      valueId={formState.partnerOrg}
                      onChangeId={(id) =>
                        setFormState((prev) => ({
                          ...prev,
                          partnerOrg: id,
                        }))
                      }
                    />

                    <FormControl>
                      <Checkbox
                        isChecked={Boolean(formState.showPartnerOrgOnMap)}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            showPartnerOrgOnMap: e.target.checked,
                          }))
                        }
                      >
                        {t('programForm.showPartnerOnMap')}
                      </Checkbox>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel
                        size="sm"
                        fontWeight="normal"
                        color="gray"
                      >
                        {t('programForm.status')}
                      </FormLabel>
                      <Select
                        value={formState.status ?? ''}
                        onChange={(e) =>
                          handleProgramStatusChange(e.target.value)
                        }
                        placeholder={t('programForm.selectStatus')}
                      >
                        <option value="Active">
                          {t('programForm.launched')}
                        </option>
                        <option value="Inactive">
                          {t('programForm.developing')}
                        </option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel
                        size="sm"
                        fontWeight="normal"
                        color="gray"
                      >
                        {t('programForm.launchDate')}
                      </FormLabel>
                      <Input
                        type="date"
                        placeholder={t('programForm.datePlaceholder')}
                        value={formState.launchDate || ''}
                        onChange={(e) =>
                          handleProgramLaunchDateChange(e.target.value)
                        }
                      />
                    </FormControl>
                  </VStack>
                </Box>

                <LocationLanguageSection
                  formState={formState}
                  setFormData={setFormState}
                  languageOptions={languageOptions}
                  onLanguagesChange={handleLanguageChange}
                />

                <StudentsInstrumentsSection
                  formState={formState}
                  setFormData={setFormState}
                />

                <AssignedDirectorsSection
                  regionId={formState.regionId}
                  formState={formState}
                  setFormData={setFormState}
                />

                <ResourcesSection
                  formState={formState}
                  setFormData={setFormState}
                  programId={program?.id}
                  backend={backend}
                  onOpenMediaModal={mediaUploadModal.onOpen}
                  onSeeAllMedia={() => setActiveTab('media')}
                />
              </>
            )}

            {activeTab === 'media' && (
              <VStack
                align="stretch"
                spacing={4}
              >
                <Heading
                  size="md"
                  fontWeight="semibold"
                >
                  {t('programForm.mediaHeading')}
                </Heading>
                <Text
                  fontSize="sm"
                  color="gray.600"
                ></Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={mediaUploadModal.onOpen}
                >
                  {t('common.add')}
                </Button>
                <HStack
                  wrap="wrap"
                  spacing={3}
                >
                  {(formState.media ?? []).map((item, index) => (
                    <MediaPreviewTag
                      key={item.id || item.s3_key || `media-${index}`}
                      item={item}
                      onRemove={() => {
                        setFormState((prev) => ({
                          ...prev,
                          media: prev.media.filter((_, idx) => idx !== index),
                        }));
                      }}
                    />
                  ))}
                </HStack>
              </VStack>
            )}
          </VStack>
        </DrawerBody>

        <DrawerFooter
          borderTopWidth="1px"
          borderColor="gray.200"
          justifyContent="space-between"
          w="full"
          p={4}
        >
          <Box>
            {program && (
              <Button
                variant="ghost"
                color="red.500"
                leftIcon={<Icon as={DeleteIcon} />}
                onClick={deleteDisclosure.onOpen}
                _hover={{ bg: 'red.50' }}
              >
                {t('common.delete')}
              </Button>
            )}
          </Box>

          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSave}
            >
              {t('common.save')}
            </Button>
          </HStack>
        </DrawerFooter>

        <Modal
          isOpen={deleteDisclosure.isOpen}
          onClose={deleteDisclosure.onClose}
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            borderRadius="md"
            p={2}
          >
            <ModalHeader
              fontSize="lg"
              fontWeight="semibold"
            >
              {t('programForm.deleteTitle')}
            </ModalHeader>

            <ModalBody color="gray.600">
              {t('programForm.deleteDesc')}
            </ModalBody>

            <ModalFooter
              justifyContent="center"
              gap={3}
            >
              <Button
                onClick={deleteDisclosure.onClose}
                bg="gray.100"
                _hover={{ bg: 'gray.200' }}
              >
                {t('common.cancel')}
              </Button>

              <Button
                colorScheme="red"
                onClick={handleDelete}
              >
                {t('programForm.deleteProgram')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {isLoadingProgramData && (
          <Center
            position="absolute"
            inset={0}
            zIndex="overlay"
            bg="rgba(107, 114, 128, 0.72)"
          >
            <Spinner
              size="xl"
              thickness="4px"
              color="teal.500"
              emptyColor="gray.200"
            />
          </Center>
        )}
      </DrawerContent>

      <MediaUploadModal
        isOpen={mediaUploadModal.isOpen}
        onClose={mediaUploadModal.onClose}
        onUploadComplete={handleMediaChange}
        formOrigin="program"
      />
    </Drawer>
  );
};
