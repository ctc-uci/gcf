import { useEffect, useState } from 'react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';

import { GetState, GetCity, GetCountries } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';

import { Select, Grid, GridItem } from '@chakra-ui/react';

export function LocationForm({ formState, setFormData }) {
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
  }, [formState.regionId, role, userId, backend]);

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
  }, [formState.regionId, backend, role, userId]);

  useEffect(() => {
    if (formState.country) {
      GetState(parseInt(formState.country)).then((result) => {
        setStateList(result);
      });
    }
  }, [formState.country]);

  useEffect(() => {
    if (formState.country && formState.state) {
      const selectedState = stateList.find(
        (state) => state.id === formState.state
      );

      console.log(selectedState);

      if (selectedState.hasCities) {
        GetCity(parseInt(formState.country), parseInt(selectedState.id)).then(
          (result) => {
            setCityList(result);
          }
        );
      }
    }
  }, [formState.country, formState.state]);

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
        {formState.regionId && (
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
        )}
      </GridItem>
      <GridItem>
        {formState.country && (
          <Select
            onChange={(e) => handleStateChange(e.target.value)}
            value={formState.state || ''}
            placeholder="Select state/province..."
            style={{ width: '100%', minHeight: 40 }}
          >
            {stateList.map((_state) => (
              <option key={_state.id} value={_state.id}>
                {_state.name}
              </option>
            ))}
          </Select>
        )}
      </GridItem>
      <GridItem>
        {formState.state && (
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
        )}
      </GridItem>
    </Grid>
  );
}
