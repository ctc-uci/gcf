import { useEffect, useMemo, useState } from 'react';

import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

import { DirectorAvatar } from './DirectorAvatar';

function normalizeDirectorRow(d) {
  if (!d || typeof d !== 'object') return null;
  const userId = d.userId ?? d.user_id;
  if (userId === null || userId === undefined || userId === '') return null;
  return {
    userId,
    firstName: d.firstName ?? d.first_name,
    lastName: d.lastName ?? d.last_name,
    picture: d.picture,
  };
}

export function AssignedDirectorsSection({ regionId, formState, setFormData }) {
  const { t } = useTranslation();
  const { backend } = useBackendContext();
  const [nameOptions, setNameOptions] = useState([]);
  const [regional, setRegional] = useState([]);

  useEffect(() => {
    if (regionId === null || regionId === undefined || regionId === '') {
      setRegional([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await backend.get(
          `/regional-directors/region/${Number(regionId)}`
        );
        if (cancelled) return;
        const data = res.data;
        if (data === null || data === undefined) {
          setRegional([]);
          return;
        }
        setRegional([
          {
            userId: data.userId ?? data.user_id,
            firstName: data.firstName,
            lastName: data.lastName,
            picture: data.picture,
          },
        ]);
      } catch {
        if (!cancelled) setRegional([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backend, regionId]);
  const programDirectors = formState.programDirectors ?? [];
  const selected = programDirectors[0];

  useEffect(() => {
    async function fetchProgramDirectors() {
      try {
        const response = await backend.get(
          '/program-directors/program-director-names'
        );
        const raw = Array.isArray(response.data) ? response.data : [];
        const directors = raw.map(normalizeDirectorRow).filter(Boolean);
        const uniqueDirectors = Array.from(
          new Map(directors.map((d) => [String(d.userId), d])).values()
        );
        setNameOptions(uniqueDirectors);
      } catch {
        setNameOptions([]);
      }
    }
    fetchProgramDirectors();
  }, [backend]);

  const directorChoices = useMemo(() => {
    const normalizedSelected = selected ? normalizeDirectorRow(selected) : null;
    const byId = new Map(nameOptions.map((d) => [String(d.userId), d]));
    const selectedId = normalizedSelected?.userId;
    if (
      selectedId !== undefined &&
      selectedId !== null &&
      selectedId !== '' &&
      !byId.has(String(selectedId))
    ) {
      byId.set(String(selectedId), normalizedSelected);
    }
    return Array.from(byId.values());
  }, [nameOptions, selected]);

  const selectedLabel =
    selected && `${selected.firstName ?? ''} ${selected.lastName ?? ''}`.trim();

  return (
    <Box>
      <Heading
        size="md"
        fontWeight="semibold"
        mb={3}
      >
        {t('programForm.assignedDirectors')}
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
            {t('programForm.regionalDirectors')}
          </FormLabel>
          {regional.length > 0 ? (
            <VStack
              align="start"
              spacing={3}
            >
              {regional.map((d) => {
                const label =
                  `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() ||
                  t('programForm.directorFallbackRegional');
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
              {t('programForm.noRegionalDirectorsForRegion')}
            </Text>
          )}
        </FormControl>

        <FormControl>
          <FormLabel
            size="sm"
            fontWeight="normal"
            color="gray"
          >
            {t('programForm.programDirector')}
          </FormLabel>
          <Menu matchWidth>
            <MenuButton
              as={Button}
              variant="outline"
              width="100%"
              textAlign="left"
              fontWeight="normal"
              rightIcon={<ChevronDownIcon />}
            >
              {selected ? (
                <HStack spacing={2}>
                  <DirectorAvatar
                    picture={selected.picture}
                    name={
                      selectedLabel || t('programForm.directorFallbackProgram')
                    }
                    boxSize="24px"
                  />
                  <Text>
                    {selectedLabel || t('programForm.directorFallbackProgram')}
                  </Text>
                </HStack>
              ) : (
                <Text color="gray.400">
                  {t('programForm.selectProgramDirector')}
                </Text>
              )}
            </MenuButton>
            <MenuList
              maxH="260px"
              overflowY="auto"
            >
              <MenuItem
                onClick={() =>
                  setFormData((prev) => ({ ...prev, programDirectors: [] }))
                }
              >
                <Text color="gray.400">
                  {t('programForm.selectProgramDirector')}
                </Text>
              </MenuItem>
              {directorChoices.map((director) => {
                const label =
                  `${director.firstName ?? ''} ${director.lastName ?? ''}`.trim() ||
                  t('programForm.directorFallbackProgram');
                return (
                  <MenuItem
                    key={director.userId}
                    onClick={() => {
                      const row = normalizeDirectorRow(director);
                      if (row)
                        setFormData((prev) => ({
                          ...prev,
                          programDirectors: [row],
                        }));
                    }}
                  >
                    <HStack spacing={2}>
                      <DirectorAvatar
                        picture={director.picture}
                        name={label}
                        boxSize="28px"
                      />
                      <Text>{label}</Text>
                    </HStack>
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
        </FormControl>
      </VStack>
    </Box>
  );
}
