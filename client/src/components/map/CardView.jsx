import React, { useEffect, useState } from 'react';

import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Text,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { GetCity, GetCountries, GetState } from 'react-country-state-city';

const CardView = ({ programId, title, city, country, state, status }) => {
  const [countryName, setCountryName] = useState('');
  const [cityName, setCityName] = useState('');
  const [instruments, setInstruments] = useState([]);
  const { backend } = useBackendContext();

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const res = await backend.get(`/program/${programId}/instruments`);
        const total = res.data.reduce((sum, inst) => sum + inst.quantity, 0);
        setInstruments(total);
      } catch (error) {
        console.error('Error fetching instruments:', error);
      }
    };
    if (programId) fetchInstruments();
  }, [programId]);

  useEffect(() => {
    const fetchNames = async () => {
      const countries = await GetCountries();
      const foundCountry = countries.find(
        (c) => parseInt(c.id) === parseInt(country)
      );
      console.log('foundCountry:', foundCountry);

      if (foundCountry) {
        setCountryName(foundCountry.name);

        const states = await GetState(parseInt(foundCountry.id));
        console.log(states);
        const foundState = states.find(
          (s) => parseInt(s.id) === parseInt(state)
        );
        console.log('state prop:', state);
        console.log('foundState:', foundState);

        if (foundState) {
          const cities = await GetCity(foundCountry.id, foundState.id);
          const foundCity = cities.find(
            (c) => parseInt(c.id) === parseInt(city)
          );
          console.log('city prop:', city);
          console.log('foundCity:', foundCity);
          if (foundCity) setCityName(foundCity.name);
        }
      }
    };
    fetchNames();
  }, [city, country, state]);

  return (
    <Card>
      <CardHeader>
        <Badge>Placeholder</Badge>
        <Badge>{status}</Badge>
        <Heading size="md">{title}</Heading>
        <Text>
          {cityName}, {countryName}
        </Text>
      </CardHeader>

      <CardBody>
        <HStack>
          <Text>{instruments}</Text>
          {/*<Text>{students}</Text>
          <Text>{started}</Text>*/}
        </HStack>
      </CardBody>
    </Card>
  );
};

export default CardView;
