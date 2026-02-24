import { useEffect, useState } from 'react';

import {
  AddIcon,
  DownloadIcon,
  HamburgerIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  IconButton,
  Input,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';
import { useTableSort } from '../../contexts/hooks/TableSort';
import { SortArrows } from '../tables/SortArrows';
import { ProgramUpdateForm } from './ProgramUpdateForm';

export function downloadProgramUpdatesAsCsv(data) {
  const headers = ['Time', 'Notes', 'Program', 'Author', 'Status'];
  const rows = (data || []).map((row) => [
    escapeCsvValue(row.updateDate),
    escapeCsvValue(row.note),
    escapeCsvValue(row.name),
    escapeCsvValue([row.firstName, row.lastName].filter(Boolean).join(' ')),
    escapeCsvValue(row.status),
  ]);
  downloadCsv(headers, rows, `program-updates-${getFilenameTimestamp()}.csv`);
}

export const ProgramUpdatesTable = ({
  data,
  setData,
  originalData,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [unorderedUpdates, setUnorderedUpdates] = useState([]);
  const { sortOrder, handleSort } = useTableSort(originalData, setData);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const openEditForm = (update) => {
    setSelectedUpdate(update);
    setIsFormOpen(true);
  };
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };
  //setUnorderedUpdates(data.map((row) => row))
  useEffect(() => {
    setUnorderedUpdates(data);
  }, [searchQuery, data]);

  useEffect(() => {
    function filterUpdates(search) {
      if (search === '') {
        setData(originalData);
        return;
      }
      // filter by search query
      const filtered = unorderedUpdates.filter(
        (update) =>
          // if no search then show everything
          update.updateDate.toLowerCase().includes(search.toLowerCase()) ||
          update.note.toLowerCase().includes(search.toLowerCase()) ||
          update.name.toLowerCase().includes(search.toLowerCase()) ||
          update.firstName.toLowerCase().includes(search.toLowerCase()) ||
          update.status.includes(search.toLowerCase())
      );

      setData(filtered);
    }

    filterUpdates(searchQuery);
  }, [searchQuery, unorderedUpdates]);

  return (
    <>
      <ProgramUpdateForm
        isOpen={isFormOpen}
        onOpen={() => setIsFormOpen(true)}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUpdate(null);
        }}
        programUpdateId={selectedUpdate?.id}
      />
      <Box mt="30px" ml="10px">
        <Flex gap={10} mb="20px" alignItems="center">
          <Heading>Program Updates</Heading>
          <SearchIcon mt="10px" ml="10px" />
          <Input
            placeholder="Type to search"
            variant="flushed"
            w="200px"
            value={searchQuery}
            onChange={handleSearch}
          />
          <HamburgerIcon mt="10px" />
          <IconButton
            aria-label="Download"
            icon={<DownloadIcon />}
            size="sm"
            variant="ghost"
            mt="10px"
            onClick={() => downloadProgramUpdatesAsCsv(data)}
          />
          <Button
            size="sm"
            rightIcon={<AddIcon />}
            onClick={() => {
              openEditForm(null);
            }}
            ml="auto"
          >
            New
          </Button>
        </Flex>

        <TableContainer overflowX="auto" maxW="100%">
          <Table variant="simple">
            <Thead>
              {/* { TODO: implement interface for row data to avoid hardcoding keys in handleSort call } */}
              <Tr>
                <Th onClick={() => handleSort('updateDate')} cursor="pointer">
                  Time{' '}
                  <SortArrows columnKey={'updateDate'} sortOrder={sortOrder} />
                </Th>
                <Th onClick={() => handleSort('note')} cursor="pointer">
                  Notes <SortArrows columnKey={'note'} sortOrder={sortOrder} />
                </Th>
                <Th onClick={() => handleSort('name')} cursor="pointer">
                  Program{' '}
                  <SortArrows columnKey={'name'} sortOrder={sortOrder} />
                </Th>
                <Th onClick={() => handleSort('firstName')} cursor="pointer">
                  Author{' '}
                  <SortArrows columnKey={'firstName'} sortOrder={sortOrder} />
                </Th>
                <Th onClick={() => handleSort('status')} cursor="pointer">
                  Status{' '}
                  <SortArrows columnKey={'status'} sortOrder={sortOrder} />
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={5}>
                    <Center py={8}>
                      <Spinner size="lg" />
                    </Center>
                  </Td>
                </Tr>
              ) : (
                data.map((row) => (
                  <Tr key={row.id} onClick={() => openEditForm(row)}>
                    <Td>{row.updateDate}</Td>
                    <Td>{row.note}</Td>
                    <Td>{row.name}</Td>
                    <Td>
                      {row.firstName} {row.lastName}
                    </Td>
                    <Td>
                      <Badge>{row.status}</Badge>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};
