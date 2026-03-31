import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

import { CurriculumLinkForm } from './CurriculumLinkForm';
import { InstrumentForm } from './InstrumentForm';
import { LocationForm } from './LocationForm';
import { MediaUploadForm } from './MediaUploadForm';
import { ProgramDirectorForm } from './ProgramDirectorForm';

export const ProgramForm = ({
  isOpen: isOpenProp,
  onOpen: onOpenProp,
  onClose: onCloseProp,
  onSave,
  program,
}) => {
  const { t } = useTranslation();
  const disclosure = useDisclosure();

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

  const [formState, setFormState] = useState({
    status: null,
    programName: null,
    launchDate: null,
    regionId: null,
    country: null,
    city: null,
    state: null,
    students: 0,
    instruments: {},
    language: null,
    programDirectors: [],
    curriculumLinks: [],
    media: [],
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function loadProgramRegionData() {
      if (!program) {
        setFormState({
          status: null,
          programName: null,
          launchDate: null,
          regionId: null,
          country: null,
          state: null,
          city: null,
          students: 0,
          instruments: {},
          language: null,
          programDirectors: [],
          curriculumLinks: [],
          media: [],
        });
        setInitialProgramDirectorIds([]);
        setInitialInstrumentQuantities({});
        setInitialCurriculumLinks([]);
        setInitialUploadedMedia([]);
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
        })
      );

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

      setFormState({
        status: program.status ?? null,
        programName: program.title ?? '',
        launchDate: program.launchDate ? program.launchDate.split('T')[0] : '',
        regionId: regionId,
        state: program.state ?? null,
        city: program.city ?? null,
        country: program.country ?? null,
        students: program.students ?? 0,
        instruments: instrumentMap,
        language: program.primaryLanguage?.toLowerCase() ?? null,

        programDirectors: mappedProgramDirectors,

        curriculumLinks: Array.isArray(program.playlists)
          ? program.playlists
              .filter((p) => p.link && p.instrumentId != null)
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
            (p) => p.link && (p.instrumentId != null || p.instrument_id != null)
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
    setFormState({ ...formState, status: status });
  }

  function handleProgramNameChange(name) {
    setFormState({ ...formState, programName: name });
  }

  function handleProgramLaunchDateChange(date) {
    setFormState({ ...formState, launchDate: date });
  }

  function handleRegionChange(regionId) {
    setFormState({ ...formState, regionId: Number(regionId), country: null });
  }

  function handleCountryChange(countryId) {
    setFormState({ ...formState, country: Number(countryId) });
  }

  function handleStudentNumberChange(numStudents) {
    setFormState({ ...formState, students: numStudents });
  }

  function handleLanguageChange(langChange) {
    setFormState({ ...formState, language: langChange });
  }

  const handleMediaChange = (newMediaFiles) => {
    setFormState((prev) => ({
      ...prev,
      media: [...(prev.media ?? []), ...newMediaFiles],
    }));
  };

  async function handleSave() {
    try {
      const data = {
        name: formState.programName,
        title: formState.programName,
        status: formState.status,
        launchDate: formState.launchDate,
        country: formState.country,
        state: formState.state,
        city: formState.city,
        students: formState.students ?? 0,
        primaryLanguage: formState.language,
        partnerOrg: 1,
        createdBy: currentUser?.uid || currentUser?.id,
        description: '',
      };

      let programId;
      const oldStudentCount = program?.students || 0;

      if (program) {
        await backend.put(`/program/${program.id}`, data);
        programId = program.id;
      } else {
        const response = await backend.post(`/program`, data);
        programId = response.data.id;
      }

      if (formState.programDirectors.length > 0) {
        for (const director of formState.programDirectors) {
          if (
            director.userId &&
            !initialProgramDirectorIds.includes(director.userId)
          ) {
            await backend.post(`/program-directors`, {
              userId: director.userId,
              programId,
            });
          }
        }
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

      const studentCountChange = formState.students - oldStudentCount;
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

      const hasStudentChange = studentCountChange !== 0;
      const hasInstrumentChange = instrumentChanges.length > 0;
      const hasMediaChange = mediaChanges.length > 0;

      if (hasStudentChange || hasInstrumentChange || hasMediaChange) {
        const updateResponse = await backend.post(`/program-updates`, {
          title: 'update program stats',
          program_id: programId,
          created_by: currentUser?.uid || currentUser?.id,
          update_date: new Date().toISOString(),
          note: 'Program update',
        });

        const updateId = updateResponse.data.id;

        if (hasStudentChange) {
          await backend.post(`/enrollmentChange`, {
            update_id: updateId,
            enrollment_change: studentCountChange,
            graduated_change: 0,
          });
        }

        if (hasInstrumentChange) {
          for (const instrumentChange of instrumentChanges) {
            await backend.post(`/instrument-changes`, {
              instrumentId: instrumentChange.instrumentId,
              updateId,
              amountChanged: instrumentChange.amountChanged,
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
            <DrawerHeader padding="0 0">
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
                <h3>{t('programForm.status')}</h3>
                <HStack>
                  <Button
                    onClick={() => handleProgramStatusChange('Inactive')}
                    colorScheme={
                      formState.status === 'Inactive' ? 'teal' : undefined
                    }
                  >
                    {t('programForm.developing')}
                  </Button>
                  <Button
                    onClick={() => handleProgramStatusChange('Active')}
                    colorScheme={
                      formState.status === 'Active' ? 'teal' : undefined
                    }
                  >
                    {t('programForm.launched')}
                  </Button>
                </HStack>
                <h3>{t('programForm.programName')}</h3>
                <Input
                  placeholder={t('programForm.programNamePlaceholder')}
                  value={formState.programName || ''}
                  onChange={(e) => handleProgramNameChange(e.target.value)}
                />
                <h3>{t('programForm.launchDate')}</h3>
                <Input
                  type="date"
                  placeholder={t('programForm.datePlaceholder')}
                  value={formState.launchDate || ''}
                  onChange={(e) =>
                    handleProgramLaunchDateChange(e.target.value)
                  }
                />
                <h3>{t('programForm.location')}</h3>
                <LocationForm
                  formState={formState}
                  setFormData={setFormState}
                />
                <h3>{t('programForm.students')}</h3>
                <NumberInput
                  min={0}
                  value={formState.students}
                  onChange={(e) => handleStudentNumberChange(Number(e))}
                >
                  <NumberInputField
                    placeholder={t('programForm.studentsPlaceholder')}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>

                <h3>{t('programForm.instrumentsQuantity')}</h3>
                <HStack wrap="wrap">
                  <InstrumentForm setFormData={setFormState} />

                  {Object.entries(formState.instruments || {}).map(
                    ([instrumentId, instrumentData]) => (
                      <Tag key={instrumentId}>
                        <TagLabel>
                          {instrumentData.name}: {instrumentData.quantity}
                        </TagLabel>
                        <TagCloseButton
                          onClick={() => {
                            setFormState((prevData) => {
                              const {
                                [instrumentId]: _,
                                ...remainingInstruments
                              } = prevData.instruments;
                              return {
                                ...prevData,
                                instruments: remainingInstruments,
                              };
                            });
                          }}
                        />
                      </Tag>
                    )
                  )}
                </HStack>
                <h3>{t('programForm.language')}</h3>
                <Select
                  placeholder={t('programForm.languagePlaceholder')}
                  value={formState.language || ''}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <option value="english">
                    {t('programForm.langEnglish')}
                  </option>
                  <option value="spanish">
                    {t('programForm.langSpanish')}
                  </option>
                  <option value="french">{t('programForm.langFrench')}</option>
                  <option value="arabic">{t('programForm.langArabic')}</option>
                  <option value="mandarin">
                    {t('programForm.langMandarin')}
                  </option>
                </Select>
                <h3>{t('programForm.programDirectors')}</h3>
                <HStack wrap="wrap">
                  <ProgramDirectorForm
                    formState={formState}
                    setFormData={setFormState}
                  />
                  {formState.programDirectors.map((director) => (
                    <Tag key={director.userId}>
                      <TagLabel>{`${director.firstName} ${director.lastName}`}</TagLabel>
                      <TagCloseButton
                        onClick={() => {
                          setFormState((prevData) => ({
                            ...prevData,
                            programDirectors: prevData.programDirectors.filter(
                              (d) => d !== director
                            ),
                          }));
                        }}
                      />
                    </Tag>
                  ))}
                </HStack>

                <h3>{t('programForm.curriculumLinks')}</h3>
                <CurriculumLinkForm
                  formState={formState}
                  setFormData={setFormState}
                  programId={program?.id}
                  backend={backend}
                />
                <HStack wrap="wrap">
                  {(formState.curriculumLinks ?? []).map((playlist) => (
                    <Tag key={`${playlist.link}-${playlist.instrumentId}`}>
                      <TagLabel
                        cursor="pointer"
                        onClick={() => {
                          window.open(
                            playlist.link,
                            '_blank',
                            'noopener,noreferrer'
                          );
                        }}
                      >
                        {playlist.instrumentName
                          ? `${playlist.instrumentName}: `
                          : ''}
                        {playlist.name}
                      </TagLabel>
                      <TagCloseButton
                        onClick={() => {
                          setFormState((prev) => ({
                            ...prev,
                            curriculumLinks: prev.curriculumLinks.filter(
                              (p) =>
                                !(
                                  p.link === playlist.link &&
                                  p.instrumentId === playlist.instrumentId
                                )
                            ),
                          }));
                        }}
                      />
                    </Tag>
                  ))}
                </HStack>
              </>
            )}

            {activeTab === 'media' && (
              <>
                <h4>{t('programForm.mediaHeading')}</h4>
                <MediaUploadForm
                  onUploadComplete={handleMediaChange}
                  uploadedMedia={formState.media}
                  onRemove={(indexToRemove) => {
                    setFormState((prev) => ({
                      ...prev,
                      media: prev.media.filter(
                        (_, idx) => idx !== indexToRemove
                      ),
                    }));
                  }}
                />
              </>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
