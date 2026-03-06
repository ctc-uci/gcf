import { useEffect, useRef, useState } from 'react';
import {
  CountrySelect,
  StateSelect,
  CitySelect,
  RegionSelect,
  GetRegions,
  GetCountriesByRegion,
  GetCountries,
  GetState,
  GetCity,
} from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';
import {
  Box,
  Button,
  Drawer,
  Image,
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
  Text,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  useDisclosure,
  VStack,
  Grid,
  GridItem,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { MediaUploadModal } from '@/components/media/MediaUploadModal';

import { FullscreenFlyoutButton } from '../FullscreenFlyoutButton';
import { useFullscreenFlyout } from '../useFullScreenFlyout.js';

// sub-component for selecting location (region/country/state/city)
const LocationForm = ({ formState, setFormData }) => {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const { backend } = useBackendContext();
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();
  const userId = currentUser?.uid;

  const [countriesList, setCountriesList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    async function getRegions() {
      try {
        if (role == 'Regional Director') {
          const regionalDirectorRegionId = await backend.get(
            `/regional-directors/${userId}`
          );
          const response = await backend.get(
            `/region/${regionalDirectorRegionId.data.regionId}`
          );
          setRegionList([response.data]);
        } else if (role == 'Program Director') {
          const response = await backend.get(
            `/program-directors/me/${userId}/region`
          );
          setRegionList([response.data]);
        } else if (role == 'Admin') {
          const response = await backend.get('/region');
          setRegionList(response.data);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    }
    getRegions();
  }, [formState.regionId, backend]);

  useEffect(() => {
    async function getCountries() {
      try {
        const id = formState.regionId;
        const response = await backend.get(`/region/${id}/countries`);
        setCountriesList(response.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    }
    getCountries();
  }, [formState.regionId]);

  useEffect(() => {
    if (formState.country) {
      GetState(parseInt(formState.country)).then((result) => {
        setStateList(result);
      });
    }
  }, [formState.country]);

  useEffect(() => {
    if (formState.country && formState.state) {
      console.log(formState.country, formState.state);
      GetCity(parseInt(formState.country), parseInt(formState.state)).then(
        (result) => {
          setCityList(result);
          console.log(result);
        }
      );
    }
  }, [formState.country, formState.state]);

  function handleRegionChange(selectedRegion) {
    setFormData({ ...formState, regionId: selectedRegion, country: null });
  }

  function handleCountryChange(countryId) {
    setFormData({ ...formState, country: Number(countryId) });
  }

  function handleStateChange(stateId) {
    setFormData({ ...formState, state: Number(stateId) });
  }

  function handleCityChange(cityId) {
    setFormData({ ...formState, city: Number(cityId) });
  }

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
      <GridItem>
        <Select
          onChange={(e) => handleRegionChange(e.target.value)}
          placeholder="Select region..."
          value={formState.regionId || ''}
        >
          {regionList.map((_region) => (
            <option key={_region.id} value={_region.id}>
              {_region.name}
            </option>
          ))}
        </Select>
      </GridItem>
      <GridItem>
        <Select
          onChange={(e) => handleCountryChange(e.target.value)}
          placeholder="Select country..."
          value={formState.country || ''}
        >
          {countriesList.map((_country) => (
            <option key={_country.id} value={_country.id}>
              {_country.name}
            </option>
          ))}
        </Select>
      </GridItem>
      <GridItem>
        <Select
          onChange={(e) => handleStateChange(e.target.value)}
          value={formState.state || ''}
          placeholder="Select state..."
          style={{ width: '100%', minHeight: 40 }}
        >
          {stateList.map((_state) => (
            <option key={_state.id} value={_state.id}>
              {_state.name}
            </option>
          ))}
        </Select>
      </GridItem>
      <GridItem>
        <Select
          onChange={(e) => handleCityChange(e.target.value)}
          value={formState.city || ''}
          placeholder="Select city..."
          style={{ width: '100%', minHeight: 40 }}
        >
          {cityList.map((_city) => (
            <option key={_city.id} value={_city.id}>
              {_city.name}
            </option>
          ))}
        </Select>
      </GridItem>
    </Grid>
  );
};

// sub-component for adding instruments
const InstrumentForm = ({ setFormData }) => {
  const [instruments, setInstruments] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState('');
  const { backend } = useBackendContext();

  function handleSubmit() {
    if (!selectedInstrumentId || quantity === 0) return;

    const instrumentObj = instruments.find(
      (instrument) => String(instrument.id) === String(selectedInstrumentId)
    );
    if (!instrumentObj) return;
    setFormData((prevData) => ({
      ...prevData,
      instruments: {
        ...prevData.instruments,
        [selectedInstrumentId]: {
          id: Number(selectedInstrumentId),
          name: instrumentObj.name,
          quantity,
        },
      },
    }));

    setSelectedInstrumentId('');
    setQuantity(0);
  }

  useEffect(() => {
    async function fetchInstruments() {
      try {
        const response = await backend.get('/instruments');
        const instrument_names = response.data;

        const instrumentMap = new Map();
        instrument_names.forEach((instrument) => {
          if (!instrumentMap.has(instrument.name)) {
            instrumentMap.set(instrument.name, instrument);
          }
        });
        const unique_instruments = Array.from(instrumentMap.values());
        setInstruments(unique_instruments);
      } catch (error) {
        console.error('Error fetching instruments:', error);
      }
    }
    fetchInstruments();
  }, [backend]);

  return (
    <HStack
      border="1px"
      borderColor="gray.200"
      padding="1"
      borderRadius="md"
      spacing={2}
    >
      <Select
        placeholder="Select Instrument"
        value={selectedInstrumentId}
        onChange={(e) => setSelectedInstrumentId(e.target.value)}
      >
        {instruments.map((instrument) => (
          <option key={instrument.id} value={instrument.id}>
            {instrument.name}
          </option>
        ))}
      </Select>
      <NumberInput
        step={1}
        defaultValue={0}
        min={0}
        width="8em"
        value={quantity}
        onChange={(valueString) => setQuantity(Number(valueString))}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Button onClick={handleSubmit}> + Add </Button>
    </HStack>
  );
};

// --- ProgramDirectorForm (inlined/standardized) ---
function ProgramDirectorForm({ formState, setFormData }) {
  const [programDirectors, setProgramDirectors] = useState([]);
  const [selectedDirector, setSelectedDirector] = useState('');
  const { backend } = useBackendContext();

  useEffect(() => {
    async function fetchProgramDirectors() {
      const response = await backend.get(
        '/program-directors/program-director-names'
      );
      const directors = response.data;

      // avoid dup key error
      const uniqueDirectors = Array.from(
        new Map((directors || []).map((d) => [d.userId, d])).values()
      );

      setProgramDirectors(uniqueDirectors);
    }
    fetchProgramDirectors();
  }, [backend]);

  function handleSubmit() {
    if (!selectedDirector) return;

    const alreadyAdded = formState.programDirectors.find(
      (d) => d.userId === selectedDirector
    );
    if (alreadyAdded) {
      alert('This director has already been added!');
      return;
    }

    const directorObj = programDirectors.find(
      (d) => d.userId === selectedDirector
    );
    if (!directorObj) return;

    setFormData((prevData) => ({
      ...prevData,
      programDirectors: [...prevData.programDirectors, directorObj],
    }));

    setSelectedDirector('');
  }

  return (
    <HStack
      border="1px"
      borderColor="gray.200"
      padding="1"
      borderRadius="md"
      spacing={2}
    >
      <Select
        placeholder="Select Program Director"
        value={selectedDirector}
        onChange={(e) => setSelectedDirector(e.target.value)}
      >
        {programDirectors.map((director) => (
          <option value={director.userId} key={director.userId}>
            {director.firstName} {director.lastName}
          </option>
        ))}
      </Select>

      <Button onClick={handleSubmit}> + Add </Button>
    </HStack>
  );
}

// --- CurriculumLinkForm (inlined/standardized) ---
function CurriculumLinkForm({ formState, setFormData }) {
  const [link, setLink] = useState('');
  const [display, setDisplay] = useState('');

  function handleSubmit() {
    if (!link?.trim()) return;

    let validLink = link.trim();
    if (!validLink.startsWith('http://') && !validLink.startsWith('https://')) {
      validLink = 'https://' + validLink;
    }

    const alreadyAdded = (formState.curriculumLinks ?? []).some(
      (p) => p.link === validLink
    );
    if (alreadyAdded) return;

    setFormData((prevData) => ({
      ...prevData,
      curriculumLinks: [
        ...(prevData.curriculumLinks ?? []),
        {
          link: validLink,
          name: (display || 'Playlist').trim() || 'Playlist',
        },
      ],
    }));

    setLink('');
    setDisplay('');
  }

  return (
    <HStack
      border="1px"
      borderColor="gray.200"
      padding="1"
      borderRadius="md"
      spacing={2}
    >
      <Input
        placeholder="Link"
        value={link || ''}
        onChange={(e) => setLink(e.target.value)}
      />
      <Input
        placeholder="Display Name"
        value={display || ''}
        onChange={(e) => setDisplay(e.target.value)}
      />
      <Button onClick={handleSubmit}>+ Add</Button>
    </HStack>
  );
}

// --- MediaPreviewTag (inlined, from MediaUploadForm) ---
function MediaPreviewTag({ item, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { backend } = useBackendContext();

  useEffect(() => {
    const fetchUrl = async () => {
      if (!item.s3_key) return;

      try {
        const res = await backend.get(
          `/images/url/${encodeURIComponent(item.s3_key)}`
        );
        if (res.data && res.data.success) {
          setPreviewUrl(res.data.url);
        }
      } catch (error) {
        console.error('Failed to fetch image URL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [item.s3_key, backend]);

  const isVideo = item.file_type?.startsWith('video/');

  return (
    <Tag maxW="250px" p={2} borderRadius="md" size="lg">
      <Box
        w="2.5rem"
        h="2.5rem"
        mr={2}
        flexShrink={0}
        borderRadius="md"
        overflow="hidden"
        bg="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {isLoading ? (
          <Spinner size="xs" />
        ) : isVideo ? (
          <video
            src={previewUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
            playsInline
          />
        ) : (
          <Image
            src={previewUrl}
            alt={item.file_name}
            boxSize="100%"
            objectFit="cover"
          />
        )}
      </Box>

      <TagLabel isTruncated title={item.file_name}>
        {item.file_name}
      </TagLabel>
      <TagCloseButton onClick={onRemove} />
    </Tag>
  );
}

// --- MediaUploadForm (inlined) ---
function MediaUploadForm({ onUploadComplete, uploadedMedia, onRemove }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}> + Add </Button>
      <MediaUploadModal
        isOpen={isOpen}
        onClose={onClose}
        onUploadComplete={onUploadComplete}
        formOrigin="program"
      />

      <HStack wrap="wrap" mt={2} spacing={3}>
        {(uploadedMedia ?? []).map((item, i) => (
          <MediaPreviewTag
            key={item.id || item.s3_key || i}
            item={item}
            onRemove={() => onRemove(i)}
          />
        ))}
      </HStack>
    </>
  );
}

// --- Main ProgramForm ---
export const ProgramForm = ({
  isOpen: isOpenProp,
  onOpen: onOpenProp,
  onClose: onCloseProp,
  onSave,
  program,
}) => {
  const disclosure = useDisclosure();

  const isControlled = onOpenProp !== undefined && onCloseProp !== undefined;
  const isOpen = isControlled ? isOpenProp : disclosure.isOpen;
  const onClose = isControlled ? onCloseProp : disclosure.onClose;
  const btnRef = useRef(null);
  const { backend } = useBackendContext();
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const { currentUser } = useAuthContext();

  const [countriesList, setCountriesList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const [initialProgramDirectorIds, setInitialProgramDirectorIds] = useState(
    []
  );
  const [initialInstrumentQuantities, setInitialInstrumentQuantities] =
    useState({});
  const [initialCurriculumLinks, setInitialCurriculumLinks] = useState([]);

  const [initialUploadedMedia, setInitialUploadedMedia] = useState([]);

  const [initialLocation, setInitialLocation] = useState({});

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
        setInitialLocation({});
        return;
      }

      console.log(JSON.stringify(program));
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
              .filter((p) => p.link)
              .map((p) => ({ link: p.link, name: p.name || 'Playlist' }))
          : [],

        media: Array.isArray(program.media)
          ? program.media.map((m) => ({
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
        (program.playlists ?? []).filter((p) => p.link).map((p) => p.link)
      );

      setInitialUploadedMedia(
        (program.media ?? []).filter((m) => m.file_name).map((m) => m.file_name)
      );
    }
    loadProgramRegionData();
  }, [program?.id, backend]);

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

      const currentLinks = (formState.curriculumLinks ?? []).map((p) => p.link);
      for (const playlist of formState.curriculumLinks ?? []) {
        if (!initialCurriculumLinks.includes(playlist.link)) {
          await backend.post(`/program/${programId}/playlists`, {
            link: playlist.link,
            name: playlist.name || 'Playlist',
          });
        }
      }
      for (const oldLink of initialCurriculumLinks) {
        if (!currentLinks.includes(oldLink)) {
          await backend.delete(`/program/${programId}/playlists`, {
            data: { link: oldLink },
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
              instrument_id: mediaChange.instrument_id || 50,
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
    <>
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
            <DrawerCloseButton left="4" right="auto" />
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
              Save{' '}
            </Button>
          </HStack>

          <DrawerBody>
            <VStack spacing={4} align="stretch" marginLeft="1em">
              <DrawerHeader padding="0 0">Program</DrawerHeader>
              <HStack w="full" spacing={0} mb={4}>
                <Button
                  flex={1}
                  variant="ghost"
                  borderRadius={0}
                  onClick={() => setActiveTab('overview')}
                  color={activeTab === 'overview' ? 'teal.500' : 'gray.600'}
                  borderBottom="2px solid"
                  borderColor={
                    activeTab === 'overview' ? 'teal.500' : 'gray.200'
                  }
                  _hover={{ bg: 'gray.50' }}
                >
                  Overview
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
                  Media
                </Button>
              </HStack>

              {activeTab === 'overview' && (
                <>
                  <h3>Status</h3>
                  <HStack>
                    <Button
                      onClick={() => handleProgramStatusChange('Inactive')}
                      colorScheme={
                        formState.status === 'Inactive' ? 'teal' : undefined
                      }
                    >
                      Developing
                    </Button>
                    <Button
                      onClick={() => handleProgramStatusChange('Active')}
                      colorScheme={
                        formState.status === 'Active' ? 'teal' : undefined
                      }
                    >
                      Launched
                    </Button>
                  </HStack>
                  <h3>Program Name</h3>
                  <Input
                    placeholder="Enter Program Name"
                    value={formState.programName || ''}
                    onChange={(e) => handleProgramNameChange(e.target.value)}
                  />
                  <h3>Launch Date</h3>
                  <Input
                    type="date"
                    placeholder="MM/DD/YYYY"
                    value={formState.launchDate || ''}
                    onChange={(e) =>
                      handleProgramLaunchDateChange(e.target.value)
                    }
                  />
                  <h3>Location</h3>
                  <LocationForm
                    formState={formState}
                    setFormData={setFormState}
                  />

                  <h3>Students</h3>
                  <NumberInput
                    min={0}
                    value={formState.students}
                    onChange={(e) => handleStudentNumberChange(Number(e))}
                  >
                    <NumberInputField placeholder="Enter # of Students" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>

                  <h3> Instrument(s) & Quantity </h3>
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
                  <h3>Language</h3>
                  <Select
                    placeholder="Language"
                    value={formState.language || ''}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="arabic">Arabic</option>
                    <option value="mandarin">Mandarin</option>
                  </Select>
                  <h3>Program Directors</h3>
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
                              programDirectors:
                                prevData.programDirectors.filter(
                                  (d) => d !== director
                                ),
                            }));
                          }}
                        />
                      </Tag>
                    ))}
                  </HStack>

                  <h3>Curriculum Links</h3>
                  <CurriculumLinkForm
                    formState={formState}
                    setFormData={setFormState}
                  />
                  <HStack wrap="wrap">
                    {(formState.curriculumLinks ?? []).map((playlist) => (
                      <Tag key={playlist.link}>
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
                          {playlist.name}
                        </TagLabel>
                        <TagCloseButton
                          onClick={() => {
                            setFormState((prev) => ({
                              ...prev,
                              curriculumLinks: prev.curriculumLinks.filter(
                                (p) => p.link !== playlist.link
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
                  <h4>Media</h4>
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
    </>
  );
};
