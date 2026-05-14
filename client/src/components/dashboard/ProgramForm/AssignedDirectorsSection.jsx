import { useEffect, useMemo, useState } from 'react';

import { CheckIcon, ChevronDownIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
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

  const selectedIdSet = useMemo(
    () => new Set(programDirectors.map((d) => String(d.userId))),
    [programDirectors]
  );

  const allDirectors = useMemo(() => {
    const byId = new Map(nameOptions.map((d) => [String(d.userId), d]));
    for (const d of programDirectors) {
      const norm = normalizeDirectorRow(d);
      if (norm && !byId.has(String(norm.userId))) {
        byId.set(String(norm.userId), norm);
      }
    }
    return Array.from(byId.values());
  }, [nameOptions, programDirectors]);

  function toggleDirector(director) {
    const row = normalizeDirectorRow(director);
    if (!row) return;
    const key = String(row.userId);
    if (selectedIdSet.has(key)) {
      setFormData((prev) => ({
        ...prev,
        programDirectors: (prev.programDirectors ?? []).filter(
          (d) => String(d.userId) !== key
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        programDirectors: [...(prev.programDirectors ?? []), row],
      }));
    }
  }

  function removeDirector(userId) {
    setFormData((prev) => ({
      ...prev,
      programDirectors: (prev.programDirectors ?? []).filter(
        (d) => String(d.userId) !== String(userId)
      ),
    }));
  }

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
            {t('programForm.programDirectors')}
          </FormLabel>

          {programDirectors.length > 0 && (
            <VStack
              align="stretch"
              spacing={2}
              mb={3}
            >
              {programDirectors.map((director) => {
                const label =
                  `${director.firstName ?? ''} ${director.lastName ?? ''}`.trim() ||
                  t('programForm.directorFallbackProgram');
                return (
                  <HStack
                    key={director.userId}
                    spacing={3}
                    px={3}
                    py={2}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    justify="space-between"
                  >
                    <HStack spacing={2}>
                      <DirectorAvatar
                        picture={director.picture}
                        name={label}
                        boxSize="28px"
                      />
                      <Text fontSize="sm">{label}</Text>
                    </HStack>
                    <IconButton
                      size="xs"
                      icon={<CloseIcon boxSize="8px" />}
                      variant="ghost"
                      colorScheme="gray"
                      aria-label={t('programForm.removeDirector')}
                      onClick={() => removeDirector(director.userId)}
                    />
                  </HStack>
                );
              })}
            </VStack>
          )}

          <Menu matchWidth>
            <MenuButton
              as={Button}
              variant="outline"
              width="100%"
              textAlign="left"
              fontWeight="normal"
              rightIcon={<ChevronDownIcon />}
            >
              <Text color="gray.500">
                {t('programForm.addProgramDirector')}
              </Text>
            </MenuButton>
            <MenuList
              maxH="260px"
              overflowY="auto"
            >
              {allDirectors.map((director) => {
                const isSelected = selectedIdSet.has(String(director.userId));
                const label =
                  `${director.firstName ?? ''} ${director.lastName ?? ''}`.trim() ||
                  t('programForm.directorFallbackProgram');
                return (
                  <MenuItem
                    key={director.userId}
                    onClick={() => toggleDirector(director)}
                  >
                    <HStack
                      spacing={2}
                      w="full"
                      justify="space-between"
                    >
                      <HStack spacing={2}>
                        <DirectorAvatar
                          picture={director.picture}
                          name={label}
                          boxSize="28px"
                        />
                        <Text>{label}</Text>
                      </HStack>
                      {isSelected && (
                        <Icon
                          as={CheckIcon}
                          color="teal.500"
                          boxSize="12px"
                        />
                      )}
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
