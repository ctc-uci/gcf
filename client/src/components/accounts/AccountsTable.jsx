import { useEffect, useMemo, useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';

import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';
import { useTranslation } from 'react-i18next';
import { FiEdit2, FiUsers } from 'react-icons/fi';

import { applyFilters } from '../../contexts/hooks/TableFilter';
import { useTableSort } from '../../contexts/hooks/TableSort';
import { DirectorAvatar } from '../dashboard/ProgramForm/DirectorAvatar';
import { SortArrows } from '../tables/SortArrows';
import CardView from './CardView';

export function downloadAccountsAsCsv(data, t) {
  const headers = [
    t('accounts.csvFirstName'),
    t('accounts.csvLastName'),
    t('accounts.csvEmail'),
    t('accounts.csvRole'),
    t('accounts.csvProgramRegion'),
  ];
  const rows = (data || []).map((user) => [
    escapeCsvValue(user.firstName),
    escapeCsvValue(user.lastName),
    escapeCsvValue(user.email),
    escapeCsvValue(user.role),
    escapeCsvValue(
      Array.isArray(user.programs) && user.programs.length > 0
        ? user.programs.join('; ')
        : ''
    ),
  ]);
  downloadCsv(headers, rows, `accounts-${getFilenameTimestamp()}.csv`);
}

const getRoleBadgeProps = (role) => {
  switch (role) {
    case 'Program Director':
      return { bg: 'teal.100', color: 'teal.800' };
    case 'Regional Director':
      return { bg: 'teal.400', color: 'white' };
    case 'Admin':
    case 'Super Admin':
      return { bg: 'teal.700', color: 'white' };
    default:
      return { bg: 'gray.200', color: 'gray.800' };
  }
};

export const AccountsTable = ({
  originalData,
  searchQuery,
  activeFilters,
  isCardView,
  onSave,
  onUpdate,
  showCreatedBy = false,
}) => {
  const { t } = useTranslation();
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const filteredData = useMemo(
    () => applyFilters(activeFilters, originalData ?? []),
    [activeFilters, originalData]
  );

  const displayData = useMemo(() => {
    if (!searchQuery) return filteredData;
    const query = searchQuery.toLowerCase();

    return filteredData.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`
        .trim()
        .toLowerCase();

      return (
        fullName.includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.programs?.some((p) => p.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, filteredData]);

  const [sortedData, setSortedData] = useState(null);

  useEffect(() => {
    setSortedData(null);
  }, [displayData]);

  const { sortOrder, handleSort } = useTableSort(displayData, setSortedData);
  const tableData = sortedData ?? displayData;

  if (!tableData || tableData.length === 0) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Box
            bg="gray.100"
            borderRadius="full"
            w="200px"
            h="200px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              as={FiUsers}
              boxSize={20}
              color="gray.300"
            />
          </Box>
          <Text
            color="gray.400"
            textAlign="center"
            fontSize="md"
            maxW="250px"
            lineHeight="tall"
          >
            {t('accounts.noAccountsYet')}
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      minW={0}
      maxW="100%"
    >
      <TableContainer maxW="100%">
        {!isCardView ? (
          <Table
            variant="simple"
            size="md"
          >
            <Thead>
              <Tr>
                <Th
                  onClick={() => handleSort('firstName')}
                  cursor="pointer"
                  color="gray.500"
                  fontSize="xs"
                  textTransform="uppercase"
                  fontWeight="semibold"
                  letterSpacing="wider"
                >
                  {t('accounts.colName')}
                  <SortArrows
                    columnKey="firstName"
                    sortOrder={sortOrder}
                  />
                </Th>
                <Th
                  onClick={() => handleSort('email')}
                  cursor="pointer"
                  color="gray.500"
                  fontSize="xs"
                  textTransform="uppercase"
                  fontWeight="semibold"
                  letterSpacing="wider"
                >
                  {t('accounts.colEmail')}
                  <SortArrows
                    columnKey="email"
                    sortOrder={sortOrder}
                  />
                </Th>
                <Th
                  onClick={() => handleSort('programs')}
                  cursor="pointer"
                  color="gray.500"
                  fontSize="xs"
                  textTransform="uppercase"
                  fontWeight="semibold"
                  letterSpacing="wider"
                  minW="220px"
                  maxW="300px"
                >
                  {t('accounts.colProgramRegion')}
                  <SortArrows
                    columnKey="programs"
                    sortOrder={sortOrder}
                  />
                </Th>
                <Th
                  onClick={() => handleSort('role')}
                  cursor="pointer"
                  color="gray.500"
                  fontSize="xs"
                  textTransform="uppercase"
                  fontWeight="semibold"
                  letterSpacing="wider"
                >
                  {t('accounts.colRole')}
                  <SortArrows
                    columnKey="role"
                    sortOrder={sortOrder}
                  />
                </Th>
                {showCreatedBy && (
                  <Th
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="semibold"
                    letterSpacing="wider"
                  >
                    {t('accounts.colCreatedBy')}
                  </Th>
                )}
                <Th
                  width="80px"
                  position="sticky"
                  right={0}
                />
              </Tr>
            </Thead>
            <Tbody>
              {tableData.map((user) => (
                <Tr
                  key={user.id}
                  _hover={{
                    bg: hoverBg,
                    '& .action-group': { opacity: 1, visibility: 'visible' },
                  }}
                  transition="background 0.2s"
                >
                  <Td>
                    <HStack spacing={3}>
                      <DirectorAvatar
                        picture={user.picture}
                        name={`${user.firstName} ${user.lastName}`}
                        boxSize="24px"
                      />
                      <Text fontWeight="medium">
                        {user.firstName} {user.lastName}
                      </Text>
                    </HStack>
                  </Td>

                  <Td>{user.email}</Td>

                  <Td
                    minW="220px"
                    maxW="300px"
                    whiteSpace="normal"
                    verticalAlign="middle"
                  >
                    {user.role === 'Regional Director' ? (
                      Array.isArray(user.region) && user.region.length > 0 ? (
                        <Wrap spacing={1}>
                          {user.region.map((r) => (
                            <WrapItem key={r}>
                              <Tag
                                size="sm"
                                borderRadius="md"
                                {...getRoleBadgeProps(user.role)}
                                fontWeight="medium"
                              >
                                {r}
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      ) : (
                        <Badge
                          px={2}
                          py={0.5}
                          borderRadius="sm"
                          bg="gray.500"
                          color="white"
                          textTransform="uppercase"
                          fontWeight="bold"
                          fontSize="xs"
                        >
                          {t('common.notAssigned')}
                        </Badge>
                      )
                    ) : Array.isArray(user.programs) &&
                      user.programs.length > 0 ? (
                      <Wrap spacing={1}>
                        {user.programs.map((program) => (
                          <WrapItem key={program}>
                            <Tag
                              size="sm"
                              borderRadius="md"
                              {...getRoleBadgeProps(user.role)}
                              fontWeight="medium"
                            >
                              {program}
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    ) : (
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="sm"
                        bg="gray.500"
                        color="white"
                        textTransform="uppercase"
                        fontWeight="bold"
                        fontSize="xs"
                      >
                        {t('common.notAssigned')}
                      </Badge>
                    )}
                  </Td>

                  <Td>
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="full"
                      {...getRoleBadgeProps(user.role)}
                      textTransform="capitalize"
                      fontWeight="normal"
                      fontSize="sm"
                    >
                      {user.role}
                    </Badge>
                  </Td>

                  {showCreatedBy && (
                    <Td>
                      <HStack spacing={2}>
                        <DirectorAvatar
                          picture={user.createdByPicture}
                          name={user.createdBy || ''}
                          boxSize="24px"
                        />
                        <Text>{user.createdBy || '-'}</Text>
                      </HStack>
                    </Td>
                  )}

                  <Td
                    p={0}
                    textAlign="right"
                    position="sticky"
                    right={0}
                  >
                    <Box
                      className="action-group"
                      opacity={0}
                      visibility="hidden"
                      transition="all 0.2s"
                      pr={4}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<FiEdit2 />}
                        colorScheme="teal"
                        bg="white"
                        onClick={() => onUpdate(user)}
                        _hover={{ bg: 'teal.500', color: 'white' }}
                        _active={{ bg: 'teal.100', color: 'teal.600' }}
                      >
                        {t('common.edit')}
                      </Button>
                    </Box>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <CardView
            data={tableData}
            onUpdate={onUpdate}
          />
        )}
      </TableContainer>
    </Box>
  );
};
