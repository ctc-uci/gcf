import { useEffect, useState } from 'react';

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

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import ReactSelect from 'react-select';

/** Mock city options until a real city source is wired up. */
const MOCK_CITY_OPTIONS = [
  { value: 'mock-city-1', label: 'Example City A (mock)' },
  { value: 'mock-city-2', label: 'Example City B (mock)' },
  { value: 'mock-city-3', label: 'Example City C (mock)' },
];

/**
 * Location & Language: country (DB) and city (mock dropdown); languages behind + Add.
 */
export function LocationLanguageSection({
  formState,
  setFormData,
  languageOptions,
  onLanguagesChange,
}) {
  const { backend } = useBackendContext();
  const [countriesList, setCountriesList] = useState([]);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  useEffect(() => {
    async function getAllCountries() {
      try {
        const response = await backend.get('/country');
        setCountriesList(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountriesList([]);
      }
    }
    getAllCountries();
  }, [backend]);

  function handleCountryChange(e) {
    const raw = e.target.value;
    const countryId = raw === '' ? null : Number(raw);
    const row = countryId
      ? countriesList.find((c) => Number(c.id) === countryId)
      : null;
    const rid = row?.regionId ?? row?.region_id;
    setFormData({
      ...formState,
      country: countryId,
      regionId:
        rid !== null && rid !== undefined ? Number(rid) : formState.regionId,
      state: null,
      mockCity: '',
    });
  }

  function handleMockCityChange(e) {
    const v = e.target.value;
    setFormData({
      ...formState,
      mockCity: v,
    });
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
        Location &amp; Language
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
            Location
          </FormLabel>
          <HStack
            align="flex-start"
            spacing={3}
          >
            <FormControl flex={1}>
              <Select
                placeholder="Enter Country"
                value={
                  formState.country !== null &&
                  formState.country !== undefined &&
                  formState.country !== ''
                    ? String(formState.country)
                    : ''
                }
                onChange={handleCountryChange}
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
                placeholder="Enter City"
                value={formState.mockCity ?? ''}
                onChange={handleMockCityChange}
              >
                {MOCK_CITY_OPTIONS.map((opt) => (
                  <option
                    key={opt.value || 'empty'}
                    value={opt.value}
                  >
                    {opt.label}
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
            Language
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
              + Add
            </Button>
          )}
          {languagePickerOpen && (
            <Box mt={2}>
              <ReactSelect
                placeholder="Language"
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
                Done
              </Button>
            </Box>
          )}
        </FormControl>
      </VStack>
    </Box>
  );
}
