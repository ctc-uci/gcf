import React, { useEffect, useState } from 'react';

import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { isoCodeToFlagIconCode } from '@/utils/isoCodeToFlagIconCode';

import 'flag-icons/css/flag-icons.min.css';

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
  const [flagCode, setFlagCode] = useState('');
  const [cityName, setCityName] = useState('');
  const [instruments, setInstruments] = useState(0);
  const [students, setStudents] = useState(0);
  const [partnerOrg, setPartnerOrg] = useState('');
  const { backend } = useBackendContext();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('en-US', {
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

    const fetchPartnerOrg = async () => {
      try {
        const res = await backend.get(
          `/program/${programId}/partner-organization`
        );
        setPartnerOrg(res.data.name);
      } catch (error) {
        console.error('Error fetching partner organization: ', error);
      }
    };

    if (programId) {
      fetchInstruments();
      fetchStudents();
      fetchPartnerOrg();
    }
  }, [programId, backend]);

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const fetchCountry = await backend.get(`/country/${country}`);

        const countries = await GetCountries();
        const foundCountry = countries.find(
          (c) => String(c.iso3) === String(fetchCountry.data.isoCode)
        );

        if (foundCountry) {
          setCountryName(foundCountry.name);
          setFlagCode(isoCodeToFlagIconCode(fetchCountry.data.isoCode));
          const states = await GetState(parseInt(foundCountry.id));
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
      } catch (error) {
        console.error('Error fetching location data: ', error);
      }
    };
    fetchNames();
  }, [city, country, state, backend]);

  return (
    <Card
      w="300px"
      h="240px"
      boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)"
    >
      <CardHeader>
        <Flex mb="10px">
          <Badge
            bg="#2C7A7B"
            color="white"
            borderRadius="6px"
            pl="8px"
            pr="8px"
          >
            {partnerOrg || 'Partner Organization'}
          </Badge>
          <Spacer />
          <Badge
            bg={status === 'Inactive' ? '#FEEBCB' : '#E6FFFA'}
            color={status === 'Inactive' ? '#7B341E' : '#2C7A7B'}
            borderRadius="6px"
            pl="8px"
            pr="8px"
            textTransform="none"
          >
            <HStack>
              <Text>{status === 'Inactive' ? 'Developing' : 'Launched'}</Text>
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={status === 'Inactive' ? '#7B341E' : '#2C7A7B'}
              />
            </HStack>
          </Badge>
        </Flex>
        <Heading
          size="md"
          mb="5px"
          fontSize="20px"
        >
          {title}
        </Heading>
        <Text fontSize="14px">
          {flagCode && (
            <span
              className={`fi fi-${flagCode}`}
              aria-hidden="true"
            />
          )}{' '}
          {cityName ? `${cityName}, ${countryName}` : countryName}
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
