import { useEffect, useState } from 'react';

import { Button, HStack, Select } from '@chakra-ui/react';

import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useTranslation } from 'react-i18next';

export function ProgramDirectorForm({ formState, setFormData }) {
  const { t } = useTranslation();
  const [programDirectors, setProgramDirectors] = useState([]);
  const [selectedDirector, setSelectedDirector] = useState('');
  const { backend } = useBackendContext();

  useEffect(() => {
    async function fetchProgramDirectors() {
      const response = await backend.get(
        '/program-directors/program-director-names'
      );
      const directors = response.data;

      const uniqueDirectors = Array.from(
        new Map((directors || []).map((d) => [d.userId, d])).values()
      );

      setProgramDirectors(uniqueDirectors);
    }
    fetchProgramDirectors();
  }, [backend]);

  function handleSubmit() {
    if (!selectedDirector) return;

    const alreadyAdded = formState.programDirectors.find(
      (d) => d.userId === selectedDirector
    );
    if (alreadyAdded) {
      alert(t('programDirectorForm.alreadyAdded'));
      return;
    }

    const directorObj = programDirectors.find(
      (d) => d.userId === selectedDirector
    );
    if (!directorObj) return;

    setFormData((prevData) => ({
      ...prevData,
      programDirectors: [...prevData.programDirectors, directorObj],
    }));

    setSelectedDirector('');
  }

  return (
    <HStack
      border="1px"
      borderColor="gray.200"
      padding="1"
      borderRadius="md"
      spacing={2}
    >
      <Select
        placeholder={t('programDirectorForm.placeholder')}
        value={selectedDirector}
        onChange={(e) => setSelectedDirector(e.target.value)}
      >
        {programDirectors.map((director) => (
          <option
            value={director.userId}
            key={director.userId}
          >
            {director.firstName} {director.lastName}
          </option>
        ))}
      </Select>

      <Button onClick={handleSubmit}>{t('common.add')}</Button>
    </HStack>
  );
}
