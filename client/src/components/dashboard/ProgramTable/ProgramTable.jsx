import { useCallback, useEffect, useState } from 'react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { GetCity } from 'react-country-state-city';

import { ProgramDisplay } from './ProgramDisplay';
import { getRouteByRole, MAP_BY_ROLE } from './programTableMappers';

function ProgramTable({ onStatsRefresh, onFilteredDataChange }) {
  const { currentUser } = useAuthContext();
  const userId = currentUser?.uid;
  const { role, loading: roleLoading } = useRoleContext();

  const { backend } = useBackendContext();
  const [originalPrograms, setOriginalPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openEditForm = (program) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  };

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

  const fetchData = useCallback(async () => {
    if (roleLoading) return;

    const route = getRouteByRole(role, userId);
    const mapRow = MAP_BY_ROLE[role];

    if (!route || !mapRow) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await backend.get(route);
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
            instrumentTypes,
            playlists,
            programDirectors,
            regionalDirectors,
            media,
            fileChanges,
            instrumentsMap,
            partnerOrgName,
          ] = await Promise.all([
            backend.get(`/program/${programId}/instruments`),
            backend.get(`/program/${programId}/playlists`),
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
              .get(`/program/${programId}/instruments`)
              .catch(() => ({ data: [] })),
            backend
              .get(`/program/${programId}/partner-organization`)
              .catch(() => ({ data: [] })),
          ]);

          return {
            ...row,
            cityName: cityName,
            instrumentTypes: instrumentTypes?.data || [],
            playlists: playlists.data,
            programDirectors: programDirectors?.data || [],
            regionalDirectors: regionalDirectors?.data || [],
            media: media?.data || [],
            fileChanges: fileChanges?.data || [],
            instrumentsMap: instrumentsMap?.data || [],
            partnerOrgName: partnerOrgName?.data || [],
          };
        })
      );
      const mappedPrograms = programDetails.map(mapRow);
      setOriginalPrograms(mappedPrograms);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [role, roleLoading, userId, backend]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!getRouteByRole(role, userId) && !roleLoading) {
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
      onSave={fetchData}
      onStatsRefresh={onStatsRefresh}
      onFilteredDataChange={onFilteredDataChange}
    />
  );
}

export default ProgramTable;
