import { useEffect, useState } from 'react';

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
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { GetCountries } from 'react-country-state-city';
import { useTranslation } from 'react-i18next';
import { BsArrowsAngleContract, BsArrowsAngleExpand } from 'react-icons/bs';

import { DirectorAvatar } from '../dashboard/ProgramForm/DirectorAvatar';

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
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchRegionalDirectors = async () => {
      try {
        const res = await backend.get('/regional-directors/all');
        const directorsList = Array.isArray(res.data) ? res.data : [];
        setRegionalDirectors(directorsList);
      } catch (err) {
        console.error('Error fetching regional directors:', err);
      }
    };
    fetchRegionalDirectors();
  }, [backend]);

  useEffect(() => {
    GetCountries().then((result) => {
      setCountries(result);
    });
  }, []);
  useEffect(() => {
    if (region) {
      setRegionName(region.name || '');
      const fetchRegionDirectors = async () => {
        try {
          const res = await backend.get(
            `/regional-directors/region/${region.id}/`
          );
          const data = Array.isArray(res.data) ? res.data : [];
          const ids = data
            .map((d) => {
              const match = regionalDirectors.find((rd) => rd.id === d.userId);
              return match?.id?.toString();
            })
            .filter(Boolean);
          setSelectedDirectors(ids);
          setOriginalDirectorIds(ids);
        } catch (err) {
          console.error('Error fetching region directors:', err);
          setSelectedDirectors([]);
          setOriginalDirectorIds([]);
        }
      };
      fetchRegionDirectors();

      const fetchRegionCountries = async () => {
        try {
          const res = await backend.get(`/region/${region.id}/countries`);
          const regionCountries = Array.isArray(res.data) ? res.data : [];

          const mapped = regionCountries
            .map((rc) => countries.find((c) => c.name === rc.name))
            .filter(Boolean);

          setSelectedCountries(mapped);
        } catch (err) {
          console.error('Error fetching region countries:', err);
        }
      };
      fetchRegionCountries();
    } else {
      setRegionName('');
      setSelectedDirectors([]);
      setOriginalDirectorIds([]);
      setSelectedCountries([]);
    }
  }, [countries, region, regionalDirectors, backend]);

  const handleSelect = (country) => {
    if (!selectedCountries.some((c) => c.iso3 === country.iso3)) {
      setSelectedCountries((prev) => [...prev, country]);
    }
  };

  const handleRemove = (iso3) => {
    setSelectedCountries((prev) => prev.filter((c) => c.iso3 !== iso3));
  };

  const saveRegion = async () => {
    if (!regionName.trim()) {
      setRegionNameError(true);
      return;
    }
    setRegionNameError(false);

    if (region) {
      await backend.put(`/region/${region.id}`, {
        name: regionName,
        last_modified: new Date().toISOString(),
      });

      const addedDirectors = selectedDirectors.filter(
        (id) => !originalDirectorIds.includes(id)
      );
      const removedDirectors = originalDirectorIds.filter(
        (id) => !selectedDirectors.includes(id)
      );

      await Promise.all([
        ...addedDirectors.map((id) =>
          backend.put(`/regional-directors/${id}/region`, {
            region_id: region.id,
          })
        ),
        ...removedDirectors.map((id) =>
          backend.delete(`/regional-directors/${id}/region/${region.id}`)
        ),
      ]);

      const existingRes = await backend.get(`/region/${region.id}/countries`);
      const existingCountries = Array.isArray(existingRes.data)
        ? existingRes.data
        : [];
      const existingNames = existingCountries.map((c) => c.name);
      const selectedNames = selectedCountries.map((c) => c.name);

      const newCountries = selectedCountries.filter(
        (c) => !existingNames.includes(c.name)
      );

      const deletedCountries = existingCountries.filter(
        (c) => !selectedNames.includes(c.name)
      );

      await Promise.all([
        ...newCountries.map((country) =>
          backend.post('/country', {
            region_id: region.id,
            name: country.name,
            iso_code: country.iso3,
            last_modified: new Date().toISOString(),
          })
        ),
        ...deletedCountries.map((country) =>
          backend.delete(`/country/${country.id}/region/${region.id}`)
        ),
      ]);
    } else {
      const newRegion = await backend.post('/region', {
        name: regionName,
        last_modified: new Date().toISOString(),
      });
      const newRegionId = newRegion.data.id;

      await Promise.all(
        selectedDirectors.map((id) =>
          backend.put(`/regional-directors/${id}/region`, {
            region_id: newRegionId,
          })
        )
      );

      await Promise.all(
        selectedCountries.map((country) =>
          backend.post('/country', {
            region_id: newRegionId,
            name: country.name,
            iso_code: country.iso3,
            last_modified: new Date().toISOString(),
          })
        )
      );
    }
  };
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size={drawerSize}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader
          display="flex"
          alignItems="center"
          gap={2}
          pr={10}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDrawerSize(drawerSize === 'md' ? 'full' : 'md')}
          >
            {drawerSize === 'md' ? (
              <BsArrowsAngleExpand />
            ) : (
              <BsArrowsAngleContract />
            )}
          </Button>
          {region ? t('regions.editRegion') : t('regions.newRegionTitle')}
        </DrawerHeader>
        <DrawerBody>
          <VStack spacing={4}>
            <FormControl
              isRequired
              isInvalid={regionNameError}
            >
              <FormLabel>{t('regions.regionName')}</FormLabel>
              <Input
                type="text"
                placeholder={t('regions.regionNamePlaceholder')}
                value={regionName}
                onChange={(e) => {
                  setRegionName(e.target.value);
                  setRegionNameError(false);
                }}
              />
              {regionNameError && (
                <FormErrorMessage>
                  {t('regions.regionNameRequired')}
                </FormErrorMessage>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>{t('regions.regionalDirector')}</FormLabel>
              <Flex
                wrap="wrap"
                gap={2}
                mb={2}
              >
                {selectedDirectors.map((dirId) => {
                  const director = regionalDirectors.find(
                    (d) => d.id.toString() === dirId
                  );
                  if (!director) return null;
                  return (
                    <Tag
                      key={dirId}
                      variant="solid"
                      colorScheme="teal"
                    >
                      <TagLabel
                        h="30px"
                        alignItems="center"
                        display="flex"
                        justifyContent="center"
                      >
                        <HStack spacing={2}>
                          <DirectorAvatar
                            picture={director.picture}
                            name={`${director.firstName} ${director.lastName}`}
                            boxSize="24px"
                          />
                          <Text>
                            {director.firstName} {director.lastName}
                          </Text>
                        </HStack>
                      </TagLabel>
                      <TagCloseButton
                        onClick={() =>
                          setSelectedDirectors((prev) =>
                            prev.filter((id) => id !== dirId)
                          )
                        }
                      />
                    </Tag>
                  );
                })}
              </Flex>
              <Menu>
                <MenuButton
                  as={Button}
                  variant="outline"
                  size="sm"
                >
                  {t('common.add')}
                </MenuButton>
                <MenuList
                  maxH="300px"
                  overflowY="auto"
                >
                  {regionalDirectors
                    ?.filter(
                      (d) => !selectedDirectors.includes(d.id.toString())
                    )
                    .map((director) => (
                      <MenuItem
                        key={director.id}
                        onClick={() =>
                          setSelectedDirectors((prev) => [
                            ...prev,
                            director.id.toString(),
                          ])
                        }
                      >
                        <HStack spacing={2}>
                          <DirectorAvatar
                            picture={director.picture}
                            name={`${director.firstName} ${director.lastName}`}
                            boxSize="24px"
                          />
                          <Text>
                            {director.firstName} {director.lastName}
                          </Text>
                        </HStack>
                      </MenuItem>
                    ))}
                </MenuList>
              </Menu>
            </FormControl>

            <FormControl>
              <FormLabel>{t('regions.assignedCountries')}</FormLabel>
              <Flex
                wrap="wrap"
                gap={2}
                mb={2}
              >
                {selectedCountries.map((country) => (
                  <Tag
                    key={country.iso3}
                    variant="solid"
                    colorScheme="gray"
                  >
                    <TagLabel>{country.name}</TagLabel>
                    <TagCloseButton
                      onClick={() => handleRemove(country.iso3)}
                    />
                  </Tag>
                ))}
              </Flex>
              <Menu>
                <MenuButton
                  as={Button}
                  variant="outline"
                  size="sm"
                >
                  {t('common.add')}
                </MenuButton>
                <MenuList
                  maxH="300px"
                  overflowY="auto"
                  p={0}
                >
                  <Box
                    position="sticky"
                    top={0}
                    bg="white"
                    zIndex={1}
                    p={2}
                    borderBottom="1px solid"
                    borderColor="gray.200"
                  >
                    <Input
                      placeholder={t('regions.searchCountries')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      width="100%"
                    />
                  </Box>
                  {filteredCountries?.map((country) => (
                    <MenuItem
                      key={country.id}
                      value={country.id}
                      onClick={() => handleSelect(country)}
                    >
                      {country.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </FormControl>

            <Flex
              width="100%"
              justifyContent="space-between"
              mt={4}
            >
              {region && (
                <Button
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  {t('common.delete')}
                </Button>
              )}
              <Flex gap={2}>
                <Button
                  variant="outline"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  colorScheme="teal"
                  isDisabled={!regionName.trim()}
                  onClick={async () => {
                    try {
                      await saveRegion();
                      toast({
                        title: t('regions.toastSaved'),
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                      });
                      onSave();
                    } catch (err) {
                      console.error('Error saving region:', err);
                      toast({
                        title: t('regions.toastErrorSave'),
                        description: err.response?.data?.message || err.message,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                      });
                    }
                  }}
                >
                  {t('common.save')}
                </Button>
              </Flex>
            </Flex>

            <AlertDialog
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    {t('regions.deleteRegionTitle')}
                  </AlertDialogHeader>
                  <AlertDialogBody>
                    {t('regions.deleteRegionBody')}
                  </AlertDialogBody>
                  <AlertDialogFooter>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={async () => {
                        try {
                          await backend.delete(`/region/${region.id}`);
                          toast({
                            title: t('regions.toastDeleted'),
                            status: 'success',
                            duration: 5000,
                            isClosable: true,
                          });
                          onDelete();
                          setIsDeleteDialogOpen(false);
                        } catch (err) {
                          console.error('Error deleting region:', err);
                        }
                      }}
                      ml={3}
                    >
                      {t('common.delete')}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog
              isOpen={isCancelDialogOpen}
              onClose={() => setIsCancelDialogOpen(false)}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader
                    fontSize="lg"
                    fontWeight="bold"
                  >
                    {t('regions.unsavedTitle')}
                  </AlertDialogHeader>
                  <AlertDialogBody>{t('regions.unsavedBody')}</AlertDialogBody>
                  <AlertDialogFooter>
                    <Button
                      isDisabled={!regionName.trim()}
                      onClick={async () => {
                        try {
                          await saveRegion();
                          toast({
                            title: t('regions.toastSaved'),
                            status: 'success',
                            duration: 5000,
                            isClosable: true,
                          });
                          onSave();
                          setIsCancelDialogOpen(false);
                        } catch (err) {
                          console.error('Error saving region:', err);
                          toast({
                            title: t('regions.toastErrorSave'),
                            description:
                              err.response?.data?.message || err.message,
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                          });
                        }
                      }}
                    >
                      {t('regions.saveExit')}
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => {
                        onClose();
                        setIsCancelDialogOpen(false);
                      }}
                      ml={3}
                    >
                      {t('common.exitWithoutSaving')}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default RegionsForm;
