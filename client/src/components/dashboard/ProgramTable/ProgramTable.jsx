import { useCallback, useEffect, useState } from 'react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';

import { ProgramDisplay } from './ProgramDisplay';
import { getRouteByRole, MAP_BY_ROLE } from './programTableMappers';

function ProgramTable({ onStatsRefresh }) {
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
          const [
            instrumentTypes,
            playlists,
            programDirectors,
            regionalDirectors,
            media,
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
          ]);

          return {
            ...row,
            instrumentTypes: instrumentTypes?.data || [],
            playlists: playlists.data,
            programDirectors: programDirectors?.data || [],
            regionalDirectors: regionalDirectors?.data || [],
            media: media?.data || [],
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
    />
  );
}

export default ProgramTable;
