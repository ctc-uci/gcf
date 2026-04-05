import { useEffect, useState } from 'react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { GetCountries } from 'react-country-state-city';

import 'react-country-state-city/dist/react-country-state-city.css';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
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

/** Same CDN path `GetCity` uses; we fetch once and slice by country (GetCity re-fetches this file per state). */
const CITIES_DATA_URL =
  'https://venkatmcajj.github.io/react-country-state-city/data/citiesminified.json';

let citiesDatasetPromise = null;

function getCitiesDataset() {
  if (!citiesDatasetPromise) {
    citiesDatasetPromise = fetch(CITIES_DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Cities data HTTP ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        citiesDatasetPromise = null;
        throw err;
      });
  }
  return citiesDatasetPromise;
}

function buildCityOptionsForLibraryCountry(dataset, libraryCountryId) {
  const idNum = Number(libraryCountryId);
  const country = Array.isArray(dataset)
    ? dataset.find((c) => Number(c.id) === idNum)
    : null;
  const states = country?.states ?? [];
  const seen = new Set();
  const merged = [];
  for (const s of states) {
    const rawCities = Array.isArray(s.cities) ? s.cities : [];
    if (rawCities.length > 0) {
      for (const c of rawCities) {
        if (c == null || c.id == null) continue;
        if (!seen.has(c.id)) {
          seen.add(c.id);
          merged.push({ id: c.id, name: c.name });
        }
      }
    } else if (s.id != null) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        merged.push({ id: s.id, name: s.name });
      }
    }
  }
  merged.sort((a, b) =>
    String(a.name ?? '').localeCompare(String(b.name ?? ''))
  );
  return merged;
}

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

  const [libraryCountries, setLibraryCountries] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  const selectedBackendCountry = formState.country
    ? countriesList.find((c) => Number(c.id) === Number(formState.country))
    : null;
  const effectiveIso = (
    formState.countryIsoCode ||
    selectedBackendCountry?.isoCode ||
    selectedBackendCountry?.iso_code ||
    ''
  )
    .toString()
    .trim();
  const libraryCountry = effectiveIso
    ? findLibraryCountryByIso(libraryCountries, effectiveIso)
    : null;
  const libraryCountryId = libraryCountry?.id ?? null;

  useEffect(() => {
    GetCountries().then((list) => setLibraryCountries(list ?? []));
  }, []);

  useEffect(() => {
    async function getCountries() {
      try {
        const response = await backend.get('/country');
        setCountriesList(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountriesList([]);
      }
    }
    getCountries();
  }, [backend]);

  useEffect(() => {
    let cancelled = false;

    async function loadAllCitiesForCountry() {
      if (libraryCountryId == null) {
        if (!cancelled) setCityList([]);
        return;
      }

      try {
        const dataset = await getCitiesDataset();
        if (cancelled) return;
        setCityList(
          buildCityOptionsForLibraryCountry(dataset, libraryCountryId)
        );
      } catch (error) {
        console.error('Error loading cities dataset:', error);
        if (!cancelled) setCityList([]);
      }
    }

    loadAllCitiesForCountry();
    return () => {
      cancelled = true;
    };
  }, [libraryCountryId]);

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

  function handleCityChange(e) {
    const cityId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      city: cityId ? Number(cityId) : null,
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

  const countryDisabled = countriesList.length === 0;
  const cityDisabled =
    !formState.country || cityList.length === 0 || countryDisabled;

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
          <HStack
            align="flex-start"
            spacing={4}
          >
            <FormControl flex={1}>
              <Select
                placeholder={t('locationForm.selectCountry')}
                value={
                  formState.country !== null &&
                  formState.country !== undefined &&
                  formState.country !== ''
                    ? String(formState.country)
                    : ''
                }
                onChange={handleCountryChange}
                isDisabled={countryDisabled}
              >
                {countriesList.map((c) => (
                  <option
                    key={c.id}
                    value={String(c.id)}
                  >
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl flex={1}>
              <Select
                placeholder={t('locationForm.selectCity')}
                value={
                  formState.city !== null &&
                  formState.city !== undefined &&
                  formState.city !== ''
                    ? String(formState.city)
                    : ''
                }
                onChange={handleCityChange}
                isDisabled={cityDisabled}
              >
                {cityList.map((c) => (
                  <option
                    key={c.id}
                    value={String(c.id)}
                  >
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </HStack>
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
            <Box mt={2}>
              <ReactSelect
                placeholder={t('programForm.languagePlaceholder')}
                isMulti
                closeMenuOnSelect={false}
                options={languageOptions}
                value={languageOptions.filter((option) =>
                  (formState.languages ?? []).includes(option.value)
                )}
                onChange={(selectedOptions) =>
                  onLanguagesChange(
                    (selectedOptions ?? []).map((option) => option.value)
                  )
                }
              />
              <Button
                size="xs"
                variant="ghost"
                mt={2}
                onClick={() => setLanguagePickerOpen(false)}
              >
                {t('programForm.done')}
              </Button>
            </Box>
          )}
        </FormControl>
      </VStack>
    </Box>
  );
}
