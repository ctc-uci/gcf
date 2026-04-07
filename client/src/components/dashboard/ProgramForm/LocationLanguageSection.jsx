import { useEffect, useRef, useState } from 'react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { GetCity, GetCountries, GetState } from 'react-country-state-city';

import 'react-country-state-city/dist/react-country-state-city.css';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  VStack,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';

const STATELESS_COUNTRIES = new Set([
  145, // Monaco
  238, // Vatican City
  199, // Singapore
  33, // Brunei
  60, // Djibouti
  117, // Kuwait
  228, // Tuvalu
  49, // Comoros
  66, // El Salvador
]);

function findLibraryCountryByIso(libraryCountries, isoInput) {
  const code = String(isoInput ?? '')
    .trim()
    .toUpperCase();
  if (!code || !libraryCountries?.length) return null;
  return (
    libraryCountries.find((c) => {
      const i2 = String(c.iso2 ?? '').toUpperCase();
      const i3 = String(c.iso3 ?? '').toUpperCase();
      return code === i2 || code === i3;
    }) ?? null
  );
}

export function LocationLanguageSection({
  formState,
  setFormData,
  languageOptions,
  onLanguagesChange,
}) {
  const { t } = useTranslation();
  const { backend } = useBackendContext();

  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();
  const userId = currentUser?.uid;

  const [libraryCountries, setLibraryCountries] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
  const languagePickerRef = useRef(null);

  useEffect(() => {
    if (!languagePickerOpen) return undefined;
    function handlePointerDown(event) {
      const el = languagePickerRef.current;
      if (!el || el.contains(event.target)) return;
      setLanguagePickerOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [languagePickerOpen]);

  const selectedBackendCountry = formState.country
    ? countriesList.find((c) => Number(c.id) === Number(formState.country))
    : null;
  const isoCodeFromBackend =
    selectedBackendCountry?.isoCode ?? selectedBackendCountry?.iso_code;
  const effectiveIso = formState.countryIsoCode ?? isoCodeFromBackend ?? null;
  const libraryCountry = effectiveIso
    ? findLibraryCountryByIso(libraryCountries, effectiveIso)
    : null;
  const libraryCountryId = libraryCountry?.id ?? null;
  const isStateless =
    libraryCountryId !== null && STATELESS_COUNTRIES.has(libraryCountryId);

  useEffect(() => {
    GetCountries()
      .then((list) => setLibraryCountries(list ?? []))
      .catch(() => setLibraryCountries([]));
  }, []);

  useEffect(() => {
    async function getRegions() {
      try {
        if (role === 'Regional Director') {
          const regionalDirectorRegionId = await backend.get(
            `/regional-directors/${userId}`
          );
          const response = await backend.get(
            `/region/${regionalDirectorRegionId.data.regionId}`
          );
          setRegionList([response.data]);
        } else if (role === 'Program Director') {
          const response = await backend.get(
            `/program-directors/me/${userId}/region`
          );
          setRegionList([response.data]);
        } else if (role === 'Admin') {
          const response = await backend.get('/region');
          setRegionList(response.data);
        } else {
          setRegionList([]);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
        setRegionList([]);
      }
    }
    getRegions();
  }, [backend, role, userId]);

  useEffect(() => {
    async function getCountries() {
      try {
        const id = formState.regionId;
        if (id) {
          const response = await backend.get(`/region/${id}/countries`);
          setCountriesList(Array.isArray(response.data) ? response.data : []);
        } else {
          setCountriesList([]);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountriesList([]);
      }
    }
    getCountries();
  }, [formState.regionId, backend]);

  useEffect(() => {
    if (libraryCountryId !== null) {
      GetState(parseInt(libraryCountryId, 10))
        .then((result) => setStateList(result ?? []))
        .catch(() => setStateList([]));
    } else {
      setStateList([]);
    }
  }, [libraryCountryId]);

  useEffect(() => {
    if (libraryCountryId !== null && formState.state) {
      const selectedState = stateList.find(
        (state) => Number(state.id) === Number(formState.state)
      );

      if (selectedState) {
        GetCity(parseInt(libraryCountryId, 10), parseInt(selectedState.id, 10))
          .then((result) => setCityList(result ?? []))
          .catch(() => setCityList([]));
      } else {
        setCityList([]);
      }
    } else {
      setCityList([]);
    }
  }, [libraryCountryId, formState.state, stateList]);

  function handleCountryChange(e) {
    const raw = e.target.value;
    const countryId = raw === '' ? null : Number(raw);
    const row = countryId
      ? countriesList.find((c) => Number(c.id) === countryId)
      : null;
    const rid = row?.regionId ?? row?.region_id;

    const isoRaw = row?.isoCode ?? row?.iso_code;
    const countryIsoCode =
      countryId && isoRaw != null && String(isoRaw).trim() !== ''
        ? String(isoRaw).trim().toUpperCase()
        : null;

    setFormData((prev) => ({
      ...prev,
      country: countryId,
      countryIsoCode,
      regionId: rid !== null && rid !== undefined ? Number(rid) : prev.regionId,
      state: null,
      city: null,
    }));
  }

  function handleRegionChange(selectedRegion) {
    const regionId = selectedRegion ? Number(selectedRegion) : null;
    setFormData((prev) => ({
      ...prev,
      regionId,
      country: null,
      countryIsoCode: null,
      state: null,
      city: null,
    }));
  }

  function handleCityChange(e) {
    const cityId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      city: cityId ? Number(cityId) : null,
    }));
  }

  function handleStateChange(stateId) {
    setFormData((prev) => ({
      ...prev,
      state: stateId ? Number(stateId) : null,
      city: null,
    }));
  }

  function removeLanguage(code) {
    const next = (formState.languages ?? []).filter((c) => c !== code);
    onLanguagesChange(next);
  }

  const languageTags = (formState.languages ?? []).map((code) => {
    const opt = languageOptions.find((o) => o.value === code);
    return { code, label: opt?.label ?? code };
  });

  return (
    <Box>
      <Heading
        size="md"
        fontWeight="semibold"
        mb={3}
      >
        {t('programForm.locationAndLanguage')}
      </Heading>

      <VStack
        align="stretch"
        spacing={4}
      >
        <Box>
          <FormLabel
            size="sm"
            fontWeight="normal"
            color="gray"
            mb={2}
          >
            {t('programForm.locationRowLabel')}
          </FormLabel>

          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={6}
          >
            <GridItem>
              <Select
                onChange={(e) => handleRegionChange(e.target.value)}
                placeholder={t('locationForm.selectRegion')}
                value={formState.regionId || ''}
              >
                {regionList.map((_region) => (
                  <option
                    key={_region.id}
                    value={_region.id}
                  >
                    {_region.name}
                  </option>
                ))}
              </Select>
            </GridItem>

            <GridItem>
              {formState.regionId && (
                <Select
                  onChange={handleCountryChange}
                  placeholder={t('locationForm.selectCountry')}
                  value={formState.country || ''}
                >
                  {countriesList.map((_country) => (
                    <option
                      key={_country.id}
                      value={_country.id}
                    >
                      {_country.name}
                    </option>
                  ))}
                </Select>
              )}
            </GridItem>

            <GridItem>
              {formState.country && stateList.length > 0 && (
                <Select
                  onChange={(e) => handleStateChange(e.target.value)}
                  value={formState.state || ''}
                  placeholder={
                    isStateless
                      ? t('locationForm.selectCity')
                      : t('locationForm.selectState')
                  }
                >
                  {stateList.map((_state) => (
                    <option
                      key={_state.id}
                      value={_state.id}
                    >
                      {_state.name}
                    </option>
                  ))}
                </Select>
              )}
            </GridItem>

            <GridItem>
              {formState.state && !isStateless && cityList.length > 0 && (
                <Select
                  onChange={handleCityChange}
                  value={formState.city || ''}
                  placeholder={t('locationForm.selectCity')}
                >
                  {cityList.map((_city) => (
                    <option
                      key={_city.id}
                      value={_city.id}
                    >
                      {_city.name}
                    </option>
                  ))}
                </Select>
              )}
            </GridItem>
          </Grid>
        </Box>

        <FormControl>
          <FormLabel
            size="sm"
            fontWeight="normal"
            color="gray"
          >
            {t('programForm.language')}
          </FormLabel>
          {languageTags.length > 0 && (
            <HStack
              flexWrap="wrap"
              spacing={2}
              mb={2}
            >
              {languageTags.map(({ code, label }) => (
                <Tag
                  key={code}
                  size="lg"
                  bg="gray.200"
                >
                  <TagLabel>{label}</TagLabel>
                  <TagCloseButton onClick={() => removeLanguage(code)} />
                </Tag>
              ))}
            </HStack>
          )}
          {!languagePickerOpen && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLanguagePickerOpen(true)}
            >
              {t('common.add')}
            </Button>
          )}
          {languagePickerOpen && (
            <Box
              ref={languagePickerRef}
              mt={2}
            >
              <ReactSelect
                placeholder={t('programForm.languagePlaceholder')}
                isMulti
                closeMenuOnSelect={false}
                options={languageOptions}
                components={{ MultiValue: () => null }}
                value={languageOptions.filter((option) =>
                  (formState.languages ?? []).includes(option.value)
                )}
                onChange={(selectedOptions) =>
                  onLanguagesChange(
                    (selectedOptions ?? []).map((option) => option.value)
                  )
                }
              />
            </Box>
          )}
        </FormControl>
      </VStack>
    </Box>
  );
}
