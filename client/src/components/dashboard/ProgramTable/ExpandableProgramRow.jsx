import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import {
  Box,
  Button,
  Collapse,
  HStack,
  Link,
  Tbody,
  Td,
  Text,
  Tr,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { FiEdit2 } from 'react-icons/fi';

import 'flag-icons/css/flag-icons.min.css';

import ISO6391 from 'iso-639-1';
import { useTranslation } from 'react-i18next';

import { isoCodeToFlagIconCode } from '../../../utils/isoCodeToFlagIconCode';
import { DirectorAvatar } from '../ProgramForm/DirectorAvatar';
import { formatLaunchDate } from './programTableMappers';
import { getInstrumentTagStyle } from './programTableTagConstants';
import { StatusTag } from './StatusTag';

export function ExpandableProgramRow({ p, onEdit }) {
  const { t } = useTranslation();
  const { isOpen, onToggle } = useDisclosure();
  const rowRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [editPosition, setEditPosition] = useState(null);
  const languageCodes = Array.isArray(p.languages) ? p.languages : [];

  const languageLabel = languageCodes.length
    ? languageCodes
        .map((code) => ISO6391.getName(String(code).toLowerCase()) || code)
        .join(', ')
    : '';
  const flagCode = isoCodeToFlagIconCode(p.isoCode);

  const updateEditTop = useCallback(() => {
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    setEditPosition({
      top: rect.top + rect.height / 2,
      right: window.innerWidth - rect.right + 8,
    });
  }, []);

  useLayoutEffect(() => {
    updateEditTop();
    window.addEventListener('resize', updateEditTop);
    window.addEventListener('scroll', updateEditTop, true);
    return () => {
      window.removeEventListener('resize', updateEditTop);
      window.removeEventListener('scroll', updateEditTop, true);
    };
  }, [isOpen, updateEditTop]);

  const editPortal =
    typeof document !== 'undefined' && editPosition !== null
      ? createPortal(
          <Box
            position="fixed"
            right={`${editPosition.right}px`}
            top={`${editPosition.top}px`}
            transform="translateY(-50%)"
            zIndex={2000}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            opacity={{ base: 1, md: isHovered ? 1 : 0 }}
            visibility={{
              base: 'visible',
              md: isHovered ? 'visible' : 'hidden',
            }}
            pointerEvents={{ base: 'auto', md: isHovered ? 'auto' : 'none' }}
            transition="opacity 0.2s ease, visibility 0.2s ease"
          >
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiEdit2 />}
              colorScheme="teal"
              bg="white"
              m={0}
              _hover={{ bg: 'teal.500', color: 'white' }}
              _active={{ bg: 'teal.100', color: 'teal.600' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsHovered(false);
                onEdit?.(p);
              }}
            >
              {t('common.edit')}
            </Button>
          </Box>,
          document.body
        )
      : null;

  return (
    <Fragment>
      {editPortal}
      <Tbody
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          '& > tr > td': {
            transition: 'background-color 0.2s ease',
          },
        }}
        _hover={{
          '& > tr > td': { bg: 'gray.100' },
        }}
      >
        <Tr
          ref={rowRef}
          onClick={onToggle}
          cursor="pointer"
          sx={{
            '& td': {
              borderBottom: isOpen ? 'none' : '1px solid',
              borderColor: 'gray.200',
            },
          }}
        >
          <Td>{p.title}</Td>
          <Td>
            <StatusTag status={p.status} />
          </Td>
          <Td>{formatLaunchDate(p.launchDate)}</Td>
          <Td>
            {flagCode ? (
              <>
                <span
                  className={`fi fi-${flagCode}`}
                  aria-hidden="true"
                />
                {'  '}
              </>
            ) : null}
            {p.location}
          </Td>
          <Td>{p.students}</Td>
          <Td>
            <VStack
              align="start"
              spacing={2}
            >
              {Array.isArray(p.instrumentsMap)
                ? p.instrumentsMap.map((d, idx) => {
                    const tagStyle = getInstrumentTagStyle(d.name);
                    return (
                      <Box
                        key={`${d.name}-${d.quantity}-${idx}`}
                        bg={tagStyle.bg}
                        color={tagStyle.color}
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {d.name} {d.quantity}
                      </Box>
                    );
                  })
                : null}
            </VStack>
          </Td>
          <Td>
            <HStack
              justify="space-between"
              minW="100px"
            >
              <Text>{p.totalInstruments}</Text>
            </HStack>
          </Td>
        </Tr>

        <Tr>
          <Td
            colSpan={7}
            borderBottom={isOpen ? '1px solid' : 'none'}
            borderColor="gray.200"
            p={isOpen ? undefined : 0}
          >
            <Collapse in={isOpen}>
              <HStack
                align="start"
                py={4}
              >
                <Box
                  flex="1"
                  display="grid"
                >
                  <Box
                    fontSize="sm"
                    fontWeight="semibold"
                    pb="2"
                  >
                    {t('expandableProgramRow.language')}
                  </Box>
                  <Box>{languageLabel}</Box>
                </Box>
                <Box
                  flex="1"
                  display="grid"
                >
                  <Box
                    fontSize="sm"
                    fontWeight="semibold"
                    pb="2"
                  >
                    {t('expandableProgramRow.regionalDirectors')}
                  </Box>
                  <Box>
                    <VStack
                      align="start"
                      spacing={2}
                    >
                      {Array.isArray(p.regionalDirectors)
                        ? p.regionalDirectors.map((d, idx) => (
                            <HStack
                              key={
                                d.userId ??
                                `${d.firstName}-${d.lastName}-${idx}`
                              }
                              spacing={2}
                            >
                              <DirectorAvatar
                                picture={d.picture}
                                name={`${d.firstName} ${d.lastName}`}
                                boxSize="28px"
                              />
                              <Text fontSize="sm">
                                {d.firstName} {d.lastName}
                              </Text>
                            </HStack>
                          ))
                        : null}
                    </VStack>
                  </Box>
                </Box>
                <Box
                  flex="1"
                  display="grid"
                >
                  <Box
                    fontSize="sm"
                    fontWeight="semibold"
                    pb="2"
                  >
                    {t('expandableProgramRow.programDirectors')}
                  </Box>
                  <Box>
                    <VStack
                      align="start"
                      spacing={2}
                    >
                      {Array.isArray(p.programDirectors)
                        ? p.programDirectors.map((d, idx) => (
                            <HStack
                              key={
                                d.userId ??
                                `${d.firstName}-${d.lastName}-${idx}`
                              }
                              spacing={2}
                            >
                              <DirectorAvatar
                                picture={d.picture}
                                name={`${d.firstName} ${d.lastName}`}
                                boxSize="28px"
                              />
                              <Text fontSize="sm">
                                {d.firstName} {d.lastName}
                              </Text>
                            </HStack>
                          ))
                        : null}
                    </VStack>
                  </Box>
                </Box>
                <Box
                  flex="1"
                  display="grid"
                >
                  <Box
                    fontSize="sm"
                    fontWeight="semibold"
                    pb="2"
                  >
                    {t('expandableProgramRow.curriculumLinks')}
                  </Box>
                  <Box>
                    {Array.isArray(p.playlists)
                      ? p.playlists.map((l) => (
                          <Box key={l.link}>
                            <Link
                              href={l.link}
                              color="blue"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {l.name}
                            </Link>
                          </Box>
                        ))
                      : null}
                  </Box>
                </Box>
              </HStack>
            </Collapse>
          </Td>
        </Tr>
      </Tbody>
    </Fragment>
  );
}
