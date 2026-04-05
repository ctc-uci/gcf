import { useEffect, useState } from 'react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { GetCity, GetCountries, GetState } from 'react-country-state-city';

import 'react-country-state-city/dist/react-country-state-city.css';

import { Grid, GridItem, Select } from '@chakra-ui/react';

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

export function LocationForm({ formState, setFormData }) {
  const { backend } = useBackendContext();
  const { currentUser } = useAuthContext();
  const { role } = useRoleContext();

  const userId = currentUser?.uid;

  const [libraryCountries, setLibraryCountries] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const selectedBackendCountry = formState.country
    ? countriesList.find((c) => Number(c.id) === Number(formState.country))
    : null;
  const isoCode = selectedBackendCountry?.isoCode ?? null;
  const libraryCountry = isoCode
    ? libraryCountries.find(
        (c) => String(c.iso3).toUpperCase() === String(isoCode).toUpperCase()
      )
    : null;
  const libraryCountryId = libraryCountry?.id ?? null;

  // Use library country id with hardcoded set (library's ids for countries that have no states)
  const isStateless =
    libraryCountryId !== null && STATELESS_COUNTRIES.has(libraryCountryId);

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
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    }
    getRegions();
  }, [formState.regionId, role, userId, backend]);

  useEffect(() => {
    GetCountries().then((list) => setLibraryCountries(list ?? []));
  }, []);

  useEffect(() => {
    async function getCountries() {
      try {
        const id = formState.regionId;
        if (id) {
          const response = await backend.get(`/region/${id}/countries`);
          setCountriesList(response.data);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    }
    getCountries();
  }, [formState.regionId, backend, role, userId]);

  useEffect(() => {
    if (libraryCountryId !== null) {
      GetState(parseInt(libraryCountryId, 10)).then((result) => {
        setStateList(result ?? []);
      });
    } else {
      setStateList([]);
    }
  }, [libraryCountryId]);

  useEffect(() => {
    if (libraryCountryId !== null && formState.state) {
      const selectedState = stateList.find(
        (state) => state.id === formState.state
      );

      if (selectedState?.hasCities) {
        GetCity(
          parseInt(libraryCountryId, 10),
          parseInt(selectedState.id, 10)
        ).then((result) => {
          setCityList(result ?? []);
        });
      } else {
        setCityList([]);
      }
    } else {
      setCityList([]);
    }
  }, [libraryCountryId, formState.state, stateList]);

  function handleRegionChange(selectedRegion) {
    setFormData({ ...formState, regionId: selectedRegion, country: null });
  }

  function handleCountryChange(countryId) {
    setFormData({
      ...formState,
      country: countryId ? Number(countryId) : null,
      state: null,
      city: null,
    });
  }

  function handleStateChange(stateId) {
    setFormData({
      ...formState,
      state: stateId ? Number(stateId) : null,
      city: null,
    });
  }

  function handleCityChange(cityId) {
    setFormData({ ...formState, city: Number(cityId) });
  }

  return (
    <Grid
      templateColumns="repeat(2, 1fr)"
      gap={6}
    >
      <GridItem>
        <Select
          onChange={(e) => handleRegionChange(e.target.value)}
          placeholder="Select region..."
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
            onChange={(e) => handleCountryChange(e.target.value)}
            placeholder="Select country..."
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
              isStateless ? 'Select city...' : 'Select state/province...'
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
            onChange={(e) => handleCityChange(e.target.value)}
            value={formState.city || ''}
            placeholder="Select city..."
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
  );
}
