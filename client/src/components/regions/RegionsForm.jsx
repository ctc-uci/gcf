import { useEffect, useRef, useState } from 'react';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { GetCountries } from 'react-country-state-city';
import { useTranslation } from 'react-i18next';
import { BsArrowsAngleContract, BsArrowsAngleExpand } from 'react-icons/bs';

import { DirectorAvatar } from '../dashboard/ProgramForm/DirectorAvatar';
import { ReviewProgramUpdate } from '../updates/forms/ReviewProgramUpdate';

const RegionsForm = ({ isOpen, region, onClose, onSave, onDelete }) => {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const [regionalDirectors, setRegionalDirectors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedDirectors, setSelectedDirectors] = useState([]);
  const [originalDirectorIds, setOriginalDirectorIds] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [drawerSize, setDrawerSize] = useState('md');
  const [regionName, setRegionName] = useState('');
  const [regionNameError, setRegionNameError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [assignedCountryNames, setAssignedCountryNames] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const originalValues = useRef(null);
  const reviewDisclosure = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    backend.get('/country')
      .then(res => {
        const allAssigned = Array.isArray(res.data) ? res.data : [];
        setAssignedCountryNames(allAssigned.filter(c => !region || c.regionId !== region.id).map(c => c.name));
      })
      .catch(err => console.error('Error fetching assigned countries:', err));
  }, [backend, region]);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedCountries.some(sc => sc.iso3 === c.iso3) &&
    !assignedCountryNames.includes(c.name)
  );

  useEffect(() => {
    backend.get('/regional-directors/all')
      .then(res => setRegionalDirectors(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Error fetching regional directors:', err));
  }, [backend]);

  useEffect(() => {
    GetCountries().then(setCountries);
  }, []);

  useEffect(() => {
    if (region) {
      setRegionName(region.name || '');

      backend.get(`/regional-directors/region/${region.id}/`)
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : [];
          const ids = data.map(d => regionalDirectors.find(rd => rd.id === d.userId)?.id?.toString()).filter(Boolean);
          setSelectedDirectors(ids);
          setOriginalDirectorIds(ids);
        })
        .catch(err => { console.error('Error fetching region directors:', err); setSelectedDirectors([]); setOriginalDirectorIds([]); });

      backend.get(`/region/${region.id}/countries`)
        .then(res => {
          const mapped = (Array.isArray(res.data) ? res.data : [])
            .map(rc => countries.find(c => c.name === rc.name))
            .filter(Boolean);
          setSelectedCountries(mapped);
        })
        .catch(err => console.error('Error fetching region countries:', err));
    } else {
      setRegionName('');
      setSelectedDirectors([]);
      setOriginalDirectorIds([]);
      setSelectedCountries([]);
      originalValues.current = null;
    }
  }, [countries, region, regionalDirectors, backend]);

  // Snapshot original values once directors + countries are loaded for an existing region
  useEffect(() => {
    if (region && selectedDirectors.length >= 0 && selectedCountries.length >= 0) {
      originalValues.current = {
        regionName: region.name || '',
        directorIds: [...selectedDirectors],
        countryNames: selectedCountries.map(c => c.name),
      };
    }
  }, [region, originalDirectorIds, selectedCountries]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setRegionName(''); setSelectedDirectors([]); setOriginalDirectorIds([]);
    setSelectedCountries([]); setRegionNameError(false); setSearchTerm('');
    setDrawerSize('md'); setIsSaving(false); originalValues.current = null;
  };

  const performSave = async () => {
    if (region) {
      await backend.put(`/region/${region.id}`, { name: regionName, last_modified: new Date().toISOString() });

      const addedDirectors = selectedDirectors.filter(id => !originalDirectorIds.includes(id));
      const removedDirectors = originalDirectorIds.filter(id => !selectedDirectors.includes(id));
      await Promise.all([
        ...addedDirectors.map(id => backend.put(`/regional-directors/${id}/region`, { region_id: region.id })),
        ...removedDirectors.map(id => backend.delete(`/regional-directors/${id}/region/${region.id}`)),
      ]);

      const existingRes = await backend.get(`/region/${region.id}/countries`);
      const existingCountries = Array.isArray(existingRes.data) ? existingRes.data : [];
      const existingNames = existingCountries.map(c => c.name);
      const selectedNames = selectedCountries.map(c => c.name);
      await Promise.all([
        ...selectedCountries.filter(c => !existingNames.includes(c.name)).map(country =>
          backend.post('/country', { region_id: region.id, name: country.name, iso_code: country.iso3, last_modified: new Date().toISOString() })
        ),
        ...existingCountries.filter(c => !selectedNames.includes(c.name)).map(country =>
          backend.delete(`/country/${country.id}/region/${region.id}`)
        ),
      ]);
    } else {
      const newRegion = await backend.post('/region', { name: regionName, last_modified: new Date().toISOString() });
      const newRegionId = newRegion.data.id;
      await Promise.all(selectedDirectors.map(id => backend.put(`/regional-directors/${id}/region`, { region_id: newRegionId })));
      await Promise.all(selectedCountries.map(country =>
        backend.post('/country', { region_id: newRegionId, name: country.name, iso_code: country.iso3, last_modified: new Date().toISOString() })
      ));
    }
  };

  const handleSave = async (isConfirmed = false) => {
    if (!regionName.trim()) { setRegionNameError(true); return; }
    setRegionNameError(false);

    // In edit mode, show review modal first
    if (region && !isConfirmed) {
      const orig = originalValues.current || {};
      const directorName = (id) => {
        const d = regionalDirectors.find(rd => rd.id.toString() === id);
        return d ? `${d.firstName} ${d.lastName}` : id;
      };
      setPendingChanges([
        { label: t('regions.regionName'), oldValue: orig.regionName, newValue: regionName },
        {
          label: t('regions.regionalDirector'),
          isTag: true,
          oldTags: (orig.directorIds || []).filter(id => !selectedDirectors.includes(id)).map(directorName),
          newTags: selectedDirectors.filter(id => !(orig.directorIds || []).includes(id)).map(directorName),
        },
        {
          label: t('regions.assignedCountries'),
          isTag: true,
          oldTags: (orig.countryNames || []).filter(n => !selectedCountries.map(c => c.name).includes(n)),
          newTags: selectedCountries.map(c => c.name).filter(n => !(orig.countryNames || []).includes(n)),
        },
      ]);
      reviewDisclosure.onOpen();
      return;
    }

    setIsSaving(true);
    try {
      await performSave();
      toast({ title: t('regions.toastSaved'), status: 'success', duration: 5000, isClosable: true });
      reviewDisclosure.onClose();
      resetForm();
      onSave();
    } catch (err) {
      console.error('Error saving region:', err);
      toast({ title: t('regions.toastErrorSave'), description: err.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={() => { resetForm(); onClose(); }} size={drawerSize}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader display="flex" alignItems="center" gap={2} pr={10}>
          <Button variant="ghost" size="sm" onClick={() => setDrawerSize(drawerSize === 'md' ? 'full' : 'md')}>
            {drawerSize === 'md' ? <BsArrowsAngleExpand /> : <BsArrowsAngleContract />}
          </Button>
          {region ? t('regions.editRegion') : t('regions.newRegionTitle')}
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={regionNameError}>
              <FormLabel>{t('regions.regionName')}</FormLabel>
              <Input
                type="text"
                placeholder={t('regions.regionNamePlaceholder')}
                value={regionName}
                onChange={e => { setRegionName(e.target.value); setRegionNameError(false); }}
              />
              {regionNameError && <FormErrorMessage>{t('regions.regionNameRequired')}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>{t('regions.regionalDirector')}</FormLabel>
              <Flex wrap="wrap" gap={2} mb={2}>
                {selectedDirectors.map(dirId => {
                  const director = regionalDirectors.find(d => d.id.toString() === dirId);
                  if (!director) return null;
                  return (
                    <Tag key={dirId} variant="solid" colorScheme="teal">
                      <TagLabel h="30px" alignItems="center" display="flex" justifyContent="center">
                        <HStack spacing={2}>
                          <DirectorAvatar picture={director.picture} name={`${director.firstName} ${director.lastName}`} boxSize="24px" />
                          <Text>{director.firstName} {director.lastName}</Text>
                        </HStack>
                      </TagLabel>
                      <TagCloseButton onClick={() => setSelectedDirectors(prev => prev.filter(id => id !== dirId))} />
                    </Tag>
                  );
                })}
              </Flex>
              <Menu>
                <MenuButton as={Button} variant="outline" size="sm">{t('common.add')}</MenuButton>
                <MenuList maxH="300px" overflowY="auto">
                  {regionalDirectors?.filter(d => !selectedDirectors.includes(d.id.toString())).map(director => (
                    <MenuItem key={director.id} onClick={() => setSelectedDirectors(prev => [...prev, director.id.toString()])}>
                      <HStack spacing={2}>
                        <DirectorAvatar picture={director.picture} name={`${director.firstName} ${director.lastName}`} boxSize="24px" />
                        <Text>{director.firstName} {director.lastName}</Text>
                      </HStack>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </FormControl>

            <FormControl>
              <FormLabel>{t('regions.assignedCountries')}</FormLabel>
              <Flex wrap="wrap" gap={2} mb={2}>
                {selectedCountries.map(country => (
                  <Tag key={country.iso3} variant="solid" colorScheme="gray">
                    <TagLabel>{country.name}</TagLabel>
                    <TagCloseButton onClick={() => setSelectedCountries(prev => prev.filter(c => c.iso3 !== country.iso3))} />
                  </Tag>
                ))}
              </Flex>
              <Menu>
                <MenuButton as={Button} variant="outline" size="sm">{t('common.add')}</MenuButton>
                <MenuList maxH="300px" overflowY="auto" p={0}>
                  <Box position="sticky" top={0} bg="white" zIndex={1} p={2} borderBottom="1px solid" borderColor="gray.200">
                    <Input
                      placeholder={t('regions.searchCountries')}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      width="100%"
                    />
                  </Box>
                  {filteredCountries?.map(country => (
                    <MenuItem key={country.id} value={country.id} onClick={() => setSelectedCountries(prev => [...prev, country])}>
                      {country.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </FormControl>

            <Flex width="100%" justifyContent="space-between" mt={4}>
              {region && (
                <Button colorScheme="red" variant="ghost" onClick={() => setIsDeleteDialogOpen(true)}>
                  {t('common.delete')}
                </Button>
              )}
              <Flex gap={2}>
                <Button variant="outline" onClick={() => setIsCancelDialogOpen(true)}>{t('common.cancel')}</Button>
                <Button
                  colorScheme="teal"
                  isDisabled={!regionName.trim() || isSaving}
                  isLoading={isSaving}
                  onClick={() => handleSave(false)}
                >
                  {t('common.save')}
                </Button>
              </Flex>
            </Flex>

            <AlertDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">{t('regions.deleteRegionTitle')}</AlertDialogHeader>
                  <AlertDialogBody>{t('regions.deleteRegionBody')}</AlertDialogBody>
                  <AlertDialogFooter>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
                    <Button colorScheme="red" ml={3} onClick={async () => {
                      try {
                        await backend.delete(`/region/${region.id}`);
                        toast({ title: t('regions.toastDeleted'), status: 'success', duration: 5000, isClosable: true });
                        onDelete();
                        setIsDeleteDialogOpen(false);
                      } catch (err) { console.error('Error deleting region:', err); }
                    }}>
                      {t('common.delete')}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog isOpen={isCancelDialogOpen} onClose={() => setIsCancelDialogOpen(false)}>
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">{t('regions.unsavedTitle')}</AlertDialogHeader>
                  <AlertDialogBody>{t('regions.unsavedBody')}</AlertDialogBody>
                  <AlertDialogFooter>
                    <Button isDisabled={!regionName.trim() || isSaving} isLoading={isSaving} onClick={async () => {
                      if (isSaving) return;
                      setIsSaving(true);
                      try {
                        await performSave();
                        toast({ title: t('regions.toastSaved'), status: 'success', duration: 5000, isClosable: true });
                        onSave();
                        setIsCancelDialogOpen(false);
                      } catch (err) {
                        console.error('Error saving region:', err);
                        toast({ title: t('regions.toastErrorSave'), description: err.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true });
                      } finally { setIsSaving(false); resetForm(); }
                    }}>
                      {t('regions.saveExit')}
                    </Button>
                    <Button colorScheme="red" ml={3} onClick={() => { resetForm(); onClose(); setIsCancelDialogOpen(false); }}>
                      {t('common.exitWithoutSaving')}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </VStack>
        </DrawerBody>
      </DrawerContent>

      <ReviewProgramUpdate
        isOpen={reviewDisclosure.isOpen}
        onClose={reviewDisclosure.onClose}
        onConfirm={() => handleSave(true)}
        changes={pendingChanges}
        isLoading={isSaving}
      />
    </Drawer>
  );
};

export default RegionsForm;