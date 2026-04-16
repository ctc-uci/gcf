import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Spinner,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { MediaUploadModal } from '@/components/media/MediaUploadModal';
import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import ISO6391 from 'iso-639-1';
import { useTranslation } from 'react-i18next';

import { isPdfByType } from './programFormHelpers';
import { ProgramFormMediaTab } from './ProgramFormMediaTab';
import { ProgramFormOverviewTab } from './ProgramFormOverviewTab';
import { saveProgramForm } from './programFormSave';
import { useProgramFormLoad } from './useProgramFormLoad';

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
  const mediaUploadTargetRef = useRef('media');
  const { backend } = useBackendContext();
  const { currentUser } = useAuthContext();

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
    fileChanges: [],
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

  useProgramFormLoad({
    program,
    backend,
    setFormState,
    setInitialProgramDirectorIds,
    setInitialInstrumentQuantities,
    setInitialCurriculumLinks,
    setInitialUploadedMedia,
    setInitialGraduated,
    setIsLoadingProgramData,
  });

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

  const handleUploadComplete = (newFiles) => {
    if (mediaUploadTargetRef.current === 'files') {
      const pdfs = newFiles.filter((f) => isPdfByType(f));
      const nonPdfs = newFiles.filter((f) => !isPdfByType(f));
      setFormState((prev) => ({
        ...prev,
        fileChanges: [...(prev.fileChanges ?? []), ...pdfs],
        ...(nonPdfs.length
          ? { media: [...(prev.media ?? []), ...nonPdfs] }
          : {}),
      }));
      return;
    }
    setFormState((prev) => ({
      ...prev,
      media: [...(prev.media ?? []), ...newFiles],
    }));
  };

  async function handleSave() {
    try {
      await saveProgramForm({
        backend,
        currentUser,
        program,
        formState,
        initialProgramDirectorIds,
        setInitialProgramDirectorIds,
        initialInstrumentQuantities,
        initialCurriculumLinks,
        initialGraduated,
        onSave,
        onClose,
      });
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
      <DrawerContent
        position="relative"
        overflow="hidden"
      >
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
              <ProgramFormOverviewTab
                formState={formState}
                setFormState={setFormState}
                languageOptions={languageOptions}
                onProgramNameChange={handleProgramNameChange}
                onProgramStatusChange={handleProgramStatusChange}
                onProgramLaunchDateChange={handleProgramLaunchDateChange}
                onLanguageChange={handleLanguageChange}
                programId={program?.id}
                backend={backend}
                onOpenMediaModal={() => {
                  mediaUploadTargetRef.current = 'files';
                  mediaUploadModal.onOpen();
                }}
                onSeeAllMedia={() => setActiveTab('media')}
              />
            )}

            {activeTab === 'media' && (
              <ProgramFormMediaTab
                formState={formState}
                setFormState={setFormState}
                onOpenMediaUpload={() => {
                  mediaUploadTargetRef.current = 'media';
                  mediaUploadModal.onOpen();
                }}
              />
            )}
          </VStack>
        </DrawerBody>

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
        onUploadComplete={handleUploadComplete}
        formOrigin="program"
        accept={
          mediaUploadTargetRef.current === 'files'
            ? { 'application/pdf': ['.pdf'] }
            : undefined
        }
      />
    </Drawer>
  );
};
