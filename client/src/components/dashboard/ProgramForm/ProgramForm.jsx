import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
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

  const [initialProgramDirectorIds, setInitialProgramDirectorIds] = useState(
    []
  );
  const [initialInstrumentQuantities, setInitialInstrumentQuantities] =
    useState({});
  const [initialCurriculumLinks, setInitialCurriculumLinks] = useState([]);

  const [initialUploadedMedia, setInitialUploadedMedia] = useState([]);
  const [initialGraduated, setInitialGraduated] = useState(0);

  const [formState, setFormState] = useState({
    status: null,
    programName: null,
    partnerOrg: null,
    showPartnerOrgOnMap: false,
    launchDate: null,
    regionId: null,
    country: null,
    city: null,
    mockCity: '',
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

  useEffect(() => {
    async function loadProgramRegionData() {
      if (!program) {
        setFormState({
          status: null,
          programName: null,
          partnerOrg: null,
          showPartnerOrgOnMap: false,
          launchDate: null,
          regionId: null,
          country: null,
          state: null,
          city: null,
          mockCity: '',
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

      let regionId = null;

      if (program.country) {
        try {
          const countryResponse = await backend.get(
            `/country/${program.country}`
          );
          regionId = countryResponse.data.regionId;
        } catch (error) {
          console.error('error fetching country/region', error);
        }
      }

      const mappedProgramDirectors = (program.programDirectors ?? []).map(
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
          `/program/${program.id}/instruments`
        );
        const instruments = instrumentsResponse.data || [];
        instruments.forEach((inst) => {
          const id = inst.instrumentId ?? inst.id;
          if (!id) return;
          instrumentMap[id] = {
            id,
            name: inst.name,
            quantity: inst.quantity ?? 0,
          };
          initialInstrumentMap[id] = inst.quantity ?? 0;
        });
      } catch (err) {
        console.error('Error fetching program instruments:', err);
      }

      const normalizedLanguages = (() => {
        if (Array.isArray(program.languages)) {
          return [
            ...new Set(
              program.languages
                .map((value) => String(value).trim().toLowerCase())
                .filter((value) => ISO6391.validate(value))
            ),
          ];
        }
        const existingValue = program.primaryLanguage;
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
          `/program/${program.id}/enrollment-aggregates`
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
        program.students !== null && program.students !== undefined
          ? Number(program.students)
          : netStudentsFromAgg;

      setFormState({
        status: program.status ?? null,
        programName: program.title ?? '',
        partnerOrg: program.partnerOrg ?? null,
        showPartnerOrgOnMap: program.showPartnerOrgOnMap ?? false,
        launchDate: program.launchDate ? program.launchDate.split('T')[0] : '',
        regionId: regionId,
        state: program.state ?? null,
        city: program.city ?? null,
        mockCity: '',
        country: program.country ?? null,
        students: Number.isNaN(resolvedStudents) ? 0 : resolvedStudents,
        graduatedStudents: graduatedTotal,
        instruments: instrumentMap,
        languages: normalizedLanguages,

        programDirectors: programDirectorsForForm,

        curriculumLinks: Array.isArray(program.playlists)
          ? program.playlists
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

        media: Array.isArray(program.media)
          ? program.media.map((m) => ({
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
        (program.playlists ?? [])
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
        (program.media ?? []).filter((m) => m.file_name).map((m) => m.file_name)
      );
    }
    loadProgramRegionData();
  }, [program, backend]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  function handleProgramStatusChange(status) {
    setFormState({ ...formState, status: status || null });
  }

  function handleProgramNameChange(name) {
    setFormState({ ...formState, programName: name });
  }

  function handleProgramLaunchDateChange(date) {
    setFormState({ ...formState, launchDate: date });
  }

  function handleLanguageChange(languageChanges) {
    setFormState({ ...formState, languages: languageChanges });
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

      const selectedRaw = formState.programDirectors[0]?.userId;
      const selectedNum =
        selectedRaw !== null && selectedRaw !== undefined && selectedRaw !== ''
          ? Number(selectedRaw)
          : null;
      const validSelected =
        typeof selectedNum === 'number' && !Number.isNaN(selectedNum);
      const initialDirectorNums = (initialProgramDirectorIds || []).map((id) =>
        Number(id)
      );

      if (validSelected) {
        for (const uid of initialDirectorNums) {
          if (uid !== selectedNum) {
            await backend.delete(`/program-directors/${uid}`, {
              params: { programId },
            });
          }
        }
        if (!initialDirectorNums.includes(selectedNum)) {
          await backend.post(`/program-directors`, {
            userId: selectedNum,
            programId,
          });
        }
        setInitialProgramDirectorIds([selectedNum]);
      } else {
        for (const uid of initialDirectorNums) {
          await backend.delete(`/program-directors/${uid}`, {
            params: { programId },
          });
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

      const allInstrumentIds = new Set([
        ...Object.keys(initialInstrumentQuantities || {}),
        ...Object.keys(formState.instruments || {}),
      ]);

      for (const id of allInstrumentIds) {
        const newQty = formState.instruments?.[id]?.quantity ?? 0;
        const oldQty = initialInstrumentQuantities?.[id] ?? 0;
        const instrumentDiff = newQty - oldQty;
        if (instrumentDiff !== 0) {
          instrumentChanges.push({
            instrumentId: Number(id),
            amountChanged: instrumentDiff,
          });
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

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={btnRef}
      size="lg"
    >
      <DrawerOverlay />
      <DrawerContent>
        <HStack marginBottom="1em">
          <DrawerCloseButton
            left="4"
            right="auto"
          />
          <Button
            colorScheme="teal"
            marginLeft="auto"
            marginRight="2em"
            width="5em"
            height="2em"
            top="2"
            fontSize="small"
            onClick={handleSave}
          >
            {' '}
            {t('common.save')}{' '}
          </Button>
        </HStack>

        <DrawerBody>
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
                      {/* TODO: Implement persistence and map behavior for showPartnerOrgOnMap (API + map layer). */}
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
                  regionalDirectors={program?.regionalDirectors ?? []}
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
