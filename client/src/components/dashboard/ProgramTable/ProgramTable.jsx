import { useState } from 'react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { GetCity } from 'react-country-state-city';
import useSWR from 'swr';

import { ProgramDisplay } from './ProgramDisplay';
import { getRouteByRole, MAP_BY_ROLE } from './programTableMappers';

async function getCityNameByCode(countryCode, stateCode, cityCode) {
  const countryId = parseInt(countryCode);
  const stateId = parseInt(stateCode);
  const cityId = parseInt(cityCode);

  const cities = await GetCity(countryId, stateId);

  if (!cities || !Array.isArray(cities)) {
    return '';
  }
  const city = cities.find((c) => c.id === cityId);
  return city ? city.name : '';
}

function ProgramTable({ onStatsRefresh, onFilteredDataChange }) {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role, loading: roleLoading } = useRoleContext();

  const { backend } = useBackendContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openEditForm = (program) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  };

  const route = getRouteByRole(role, userId);
  const mapRow = MAP_BY_ROLE[role];

  const fetcher = async (fetchRoute) => {
    const res = await backend.get(fetchRoute);
    const rows = Array.isArray(res.data) ? res.data : [];

    const programDetails = await Promise.all(
      rows.map(async (row) => {
        // TODO: make this more efficient with lazy loading
        const programId = row.id ?? row.programId;
        const cityName = await getCityNameByCode(
          row.country,
          row.state,
          row.city
        );

        const [
          instruments,
          playlists,
          programDirectors,
          regionalDirectors,
          media,
          fileChanges,
          partnerOrgName,
        ] = await Promise.all([
          backend
            .get(`/program/${programId}/instruments`)
            .catch(() => ({ data: [] })),
          backend
            .get(`/program/${programId}/playlists`)
            .catch(() => ({ data: [] })),
          backend
            .get(`/program/${programId}/program-directors`)
            .catch(() => ({ data: [] })),
          backend
            .get(`/program/${programId}/regional-directors`)
            .catch(() => ({ data: [] })),
          backend
            .get(`/program/${programId}/media`)
            .catch(() => ({ data: [] })),
          backend
            .get(`/fileChanges/program/${programId}`)
            .catch(() => ({ data: [] })),
          backend
            .get(`/program/${programId}/partner-organization`)
            .catch(() => ({ data: [] })),
        ]);

        return {
          ...row,
          cityName: cityName,
          instrumentTypes: instruments?.data || [],
          playlists: playlists.data || [],
          programDirectors: programDirectors?.data || [],
          regionalDirectors: regionalDirectors?.data || [],
          media: media?.data || [],
          fileChanges: fileChanges?.data || [],
          instrumentsMap: instruments?.data || [],
          partnerOrgName: partnerOrgName?.data || [],
        };
      })
    );
    const mappedPrograms = programDetails.map(mapRow);
    return mappedPrograms;
  };

  const shouldFetch = !roleLoading && route && mapRow;

  const {
    data: originalPrograms = [],
    isLoading,
    mutate,
  } = useSWR(shouldFetch ? route : null, fetcher);

  if (!route && !roleLoading) {
    return null;
  }

  return (
    <ProgramDisplay
      originalData={originalPrograms}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isLoading={isLoading}
      role={role}
      userId={userId}
      openEditForm={openEditForm}
      isFormOpen={isFormOpen}
      setIsFormOpen={setIsFormOpen}
      selectedProgram={selectedProgram}
      setSelectedProgram={setSelectedProgram}
      onSave={() => mutate()}
      onStatsRefresh={onStatsRefresh}
      onFilteredDataChange={onFilteredDataChange}
    />
  );
}

export default ProgramTable;
