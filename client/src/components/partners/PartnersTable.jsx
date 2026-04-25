import { useEffect, useState } from 'react';

import { SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';

import { EmptyStateBadge } from '@/components/badges/EmptyStateBadge';
import { useTableSort } from '@/contexts/hooks/TableSort';
import { useTranslation } from 'react-i18next';
import { FiEdit2 } from 'react-icons/fi';

import { SortArrows } from '../tables/SortArrows';

export const PartnersTable = ({ partners, isLoading, onEdit }) => {
  const { t } = useTranslation();
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedData, setSortedData] = useState(null);

  const filtered = partners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setSortedData(null);
  }, [searchQuery]);

  const { sortOrder, handleSort } = useTableSort(filtered, setSortedData);
  const tableData = sortedData ?? filtered;

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        py={10}
      >
        <Spinner
          size="xl"
          color="gray.500"
        />
      </Box>
    );
  }

  return (
    <Box>
      <InputGroup
        mb={4}
        maxW="320px"
      >
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder={t('partners.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      {tableData.length === 0 ? (
        <EmptyStateBadge variant="no-partners" />
      ) : (
        <Box
          bg="white"
          borderRadius="xl"
          overflow="hidden"
          minW={0}
          maxW="100%"
        >
          <TableContainer maxW="100%">
            <Table
              variant="simple"
              size="md"
            >
              <Thead>
                <Tr>
                  <Th
                    onClick={() => handleSort('name')}
                    cursor="pointer"
                    color="gray.500"
                    fontSize="xs"
                    textTransform="uppercase"
                    fontWeight="semibold"
                    letterSpacing="wider"
                  >
                    <Text as="span">{t('partners.columnName')}</Text>
                    <SortArrows
                      columnKey="name"
                      sortOrder={sortOrder}
                    />
                  </Th>
                  <Th
                    width="80px"
                    position="sticky"
                    right={0}
                  />
                </Tr>
              </Thead>
              <Tbody>
                {tableData.map((partner) => (
                  <Tr
                    key={partner.id}
                    _hover={{
                      bg: hoverBg,
                      '& .action-group': { opacity: 1, visibility: 'visible' },
                    }}
                    transition="background 0.2s"
                  >
                    <Td>{partner.name}</Td>
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
                          onClick={() => onEdit(partner)}
                        >
                          {t('common.edit')}
                        </Button>
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};
