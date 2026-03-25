import React, { useEffect, useState } from 'react';

import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { GetCity, GetCountries, GetState } from 'react-country-state-city';
import { FaMusic, FaRegCalendar, FaUser } from 'react-icons/fa';

const CardView = ({
  programId,
  title,
  city,
  country,
  state,
  status,
  started,
}) => {
  const [countryName, setCountryName] = useState('');
  const [flag, setFlag] = useState('');
  const [cityName, setCityName] = useState('');
  const [instruments, setInstruments] = useState(0);
  const [students, setStudents] = useState(0);
  const { backend } = useBackendContext();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        const res = await backend.get(`/program/${programId}/instruments`);
        const total = res.data.reduce(
          (sum, inst) => sum + Number(inst.quantity),
          0
        );
        setInstruments(total);
      } catch (error) {
        console.error('Error fetching instruments: ', error);
      }
    };

    const fetchStudents = async () => {
      try {
        const res = await backend.get(`/program/students/${programId}`);
        const total = res.data.reduce(
          (sum, row) =>
            sum + Number(row.enrollmentChange) - Number(row.graduatedChange),
          0
        );
        setStudents(total);
      } catch (error) {
        console.error('Error fetching students: ', error);
      }
    };

    if (programId) {
      fetchInstruments();
      fetchStudents();
    }
  }, [programId, backend]);

  useEffect(() => {
    const fetchNames = async () => {
      const countries = await GetCountries();
      const foundCountry = countries.find(
        (c) => parseInt(c.id) === parseInt(country)
      );

      if (foundCountry) {
        setCountryName(foundCountry.name);
        setFlag(foundCountry.emoji);
        const states = await GetState(parseInt(foundCountry.id));
        console.log(states);
        const foundState = states.find(
          (s) => parseInt(s.id) === parseInt(state)
        );

        if (foundState) {
          const cities = await GetCity(foundCountry.id, foundState.id);
          const foundCity = cities.find(
            (c) => parseInt(c.id) === parseInt(city)
          );
          if (foundCity) setCityName(foundCity.name);
        }
      }
    };
    fetchNames();
  }, [city, country, state]);

  return (
    <Card
      w="300px"
      h="240px"
      boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)"
    >
      <CardHeader>
        <HStack
          gap={20}
          mb="10px"
        >
          <Badge
            bg="#2C7A7B"
            color="white"
            borderRadius="6px"
            pl="8px"
            pr="8px"
          >
            Placeholder
          </Badge>
          <Badge
            bg="#E6FFFA"
            color="#2C7A7B"
            borderRadius="6px"
            pl="8px"
            pr="8px"
          >
            <HStack>
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg="#2C7A7B"
              />
              <Text>{status}</Text>
            </HStack>
          </Badge>
        </HStack>
        <Heading
          size="md"
          mb="5px"
          fontSize="20px"
        >
          {title}
        </Heading>
        <Text fontSize="14px">
          {flag} {cityName}, {countryName}
        </Text>
      </CardHeader>

      <Divider borderColor="gray.100" />

      <CardBody>
        <HStack
          gap={2}
          justify="center"
        >
          <VStack>
            <Icon
              as={FaMusic}
              color="#2C7A7B"
            />
            <Text
              fontWeight="bold"
              fontSize="16px"
            >
              {instruments}
            </Text>
            <Text
              color="#6A7282"
              fontSize="12px"
            >
              Instruments
            </Text>
          </VStack>

          <Divider
            orientation="vertical"
            h="60px"
            borderColor="gray.200"
          />

          <VStack>
            <Icon
              as={FaUser}
              color="#2C7A7B"
            />
            <Text
              fontWeight="bold"
              fontSize="16px"
            >
              {students}
            </Text>
            <Text
              color="#6A7282"
              fontSize="12px"
            >
              Students
            </Text>
          </VStack>

          <Divider
            orientation="vertical"
            h="60px"
            borderColor="gray.200"
          />

          <VStack>
            <Icon
              as={FaRegCalendar}
              color="#2C7A7B"
            />
            <Text
              fontWeight="bold"
              fontSize="16px"
            >
              {formatDate(started)}
            </Text>
            <Text
              color="#6A7282"
              fontSize="12px"
            >
              Started
            </Text>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

export default CardView;
