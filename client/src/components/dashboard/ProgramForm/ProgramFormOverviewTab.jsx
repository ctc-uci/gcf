import {
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';

import { PartnerOrganizationField } from '@/components/partners/PartnerOrganizationField';
import { useTranslation } from 'react-i18next';

import { AssignedDirectorsSection } from './AssignedDirectorsSection';
import { LocationLanguageSection } from './LocationLanguageSection';
import { ResourcesSection } from './ResourcesSection';
import { StudentsInstrumentsSection } from './StudentsInstrumentsSection';

export function ProgramFormOverviewTab({
  formState,
  setFormState,
  languageOptions,
  onProgramNameChange,
  onProgramStatusChange,
  onProgramLaunchDateChange,
  onLanguageChange,
  programId,
  backend,
  onOpenMediaModal,
  onSeeAllMedia,
}) {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <Heading
          size="md"
          fontWeight="semibold"
          mb={3}
        >
          {t('programForm.generalInformation')}
        </Heading>
        <VStack
          align="stretch"
          spacing={4}
        >
          <FormControl isRequired>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              {t('programForm.programName')}
            </FormLabel>
            <Input
              placeholder={t('programForm.enterProgramTitle')}
              value={formState.programName || ''}
              onChange={(e) => onProgramNameChange(e.target.value)}
            />
          </FormControl>

          <PartnerOrganizationField
            label={t('programForm.partnerOrgName')}
            valueId={formState.partnerOrg}
            onChangeId={(id) =>
              setFormState((prev) => ({
                ...prev,
                partnerOrg: id,
              }))
            }
          />

          <FormControl>
            <Checkbox
              isChecked={Boolean(formState.showPartnerOrgOnMap)}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  showPartnerOrgOnMap: e.target.checked,
                }))
              }
            >
              {t('programForm.showPartnerOnMap')}
            </Checkbox>
            {/* TODO: Implement persistence and map behavior for showPartnerOrgOnMap (API + map layer). */}
          </FormControl>

          <FormControl isRequired>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              {t('programForm.status')}
            </FormLabel>
            <Select
              value={formState.status ?? ''}
              onChange={(e) => onProgramStatusChange(e.target.value)}
              placeholder={t('programForm.selectStatus')}
            >
              <option value="Active">{t('programForm.launched')}</option>
              <option value="Inactive">{t('programForm.developing')}</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel
              size="sm"
              fontWeight="normal"
              color="gray"
            >
              {t('programForm.launchDate')}
            </FormLabel>
            <Input
              type="date"
              placeholder={t('programForm.datePlaceholder')}
              value={formState.launchDate || ''}
              onChange={(e) => onProgramLaunchDateChange(e.target.value)}
            />
          </FormControl>
        </VStack>
      </Box>

      <LocationLanguageSection
        formState={formState}
        setFormData={setFormState}
        languageOptions={languageOptions}
        onLanguagesChange={onLanguageChange}
      />

      <StudentsInstrumentsSection
        formState={formState}
        setFormData={setFormState}
      />

      <AssignedDirectorsSection
        regionId={formState.regionId}
        formState={formState}
        setFormData={setFormState}
      />

      <ResourcesSection
        formState={formState}
        setFormData={setFormState}
        programId={programId}
        backend={backend}
        onOpenMediaModal={onOpenMediaModal}
        onSeeAllMedia={onSeeAllMedia}
      />
    </>
  );
}
