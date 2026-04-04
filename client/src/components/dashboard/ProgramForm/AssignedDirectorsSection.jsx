import { useEffect, useMemo, useState } from 'react';

import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';

import { DirectorAvatar } from './DirectorAvatar';

export function AssignedDirectorsSection({
  regionalDirectors = [],
  formState,
  setFormData,
}) {
  const { backend } = useBackendContext();
  const [nameOptions, setNameOptions] = useState([]);

  const regional = Array.isArray(regionalDirectors) ? regionalDirectors : [];
  const programDirectors = formState.programDirectors ?? [];
  const selected = programDirectors[0];

  useEffect(() => {
    async function fetchProgramDirectors() {
      try {
        const response = await backend.get(
          '/program-directors/program-director-names'
        );
        const directors = response.data ?? [];
        const uniqueDirectors = Array.from(
          new Map(directors.map((d) => [d.userId, d])).values()
        );
        setNameOptions(uniqueDirectors);
      } catch {
        setNameOptions([]);
      }
    }
    fetchProgramDirectors();
  }, [backend]);

  const directorChoices = useMemo(() => {
    const byId = new Map(nameOptions.map((d) => [String(d.userId), d]));
    if (selected?.userId != null && !byId.has(String(selected.userId))) {
      byId.set(String(selected.userId), selected);
    }
    return Array.from(byId.values());
  }, [nameOptions, selected]);

  const selectedLabel =
    selected && `${selected.firstName ?? ''} ${selected.lastName ?? ''}`.trim();

  function handleProgramDirectorChange(e) {
    const v = e.target.value;
    if (!v) {
      setFormData((prev) => ({ ...prev, programDirectors: [] }));
      return;
    }
    const found = directorChoices.find((d) => String(d.userId) === String(v));
    if (!found) return;
    setFormData((prev) => ({
      ...prev,
      programDirectors: [
        {
          userId: found.userId,
          firstName: found.firstName,
          lastName: found.lastName,
          picture: found.picture,
        },
      ],
    }));
  }

  return (
    <Box>
      <Heading
        size="md"
        fontWeight="semibold"
        mb={3}
      >
        Assigned Directors
      </Heading>
      <VStack
        align="stretch"
        spacing={4}
      >
        <FormControl>
          <FormLabel
            size="sm"
            fontWeight="normal"
            color="gray"
          >
            Regional Director(s)
          </FormLabel>
          {regional.length > 0 ? (
            <VStack
              align="start"
              spacing={3}
            >
              {regional.map((d) => {
                const label =
                  `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() ||
                  'Regional Director';
                return (
                  <HStack
                    key={d.userId}
                    spacing={3}
                  >
                    <DirectorAvatar
                      picture={d.picture}
                      name={label}
                    />
                    <Text fontSize="sm">{label}</Text>
                  </HStack>
                );
              })}
            </VStack>
          ) : (
            <Text
              fontSize="sm"
              color="gray.500"
            >
              No regional directors listed for this program&apos;s region.
            </Text>
          )}
        </FormControl>

        <FormControl>
          <FormLabel
            size="sm"
            fontWeight="normal"
            color="gray"
          >
            Program Director
          </FormLabel>
          <HStack
            align="stretch"
            spacing={0}
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            bg="white"
            overflow="hidden"
            minH="40px"
          >
            <Box
              pl={3}
              pr={2}
              display="flex"
              alignItems="center"
              flexShrink={0}
            >
              <DirectorAvatar
                picture={selected?.picture}
                name={selectedLabel || 'Program Director'}
                boxSize="32px"
              />
            </Box>
            <Select
              flex={1}
              border="none"
              borderRadius="none"
              h="auto"
              minH="40px"
              py={2}
              pr={2}
              placeholder="Select Program Director"
              value={
                selected?.userId != null && selected.userId !== ''
                  ? String(selected.userId)
                  : ''
              }
              onChange={handleProgramDirectorChange}
              icon={<ChevronDownIcon />}
              iconColor="gray.500"
              _focus={{ boxShadow: 'none' }}
            >
              {directorChoices.map((director) => (
                <option
                  value={String(director.userId)}
                  key={director.userId}
                >
                  {`${director.firstName ?? ''} ${director.lastName ?? ''}`.trim() ||
                    'Program Director'}
                </option>
              ))}
            </Select>
          </HStack>
        </FormControl>
      </VStack>
    </Box>
  );
}
