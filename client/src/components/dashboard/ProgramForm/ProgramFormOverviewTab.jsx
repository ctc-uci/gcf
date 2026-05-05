import {
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Skeleton,
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
  isLoadingProgramData,
}) {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <Skeleton
          isLoaded={!isLoadingProgramData}
          fitContent
        >
          <Heading
            size="md"
            fontWeight="semibold"
            mb={3}
          >
            {t('programForm.generalInformation')}
          </Heading>
        </Skeleton>
        <VStack
          align="stretch"
          spacing={4}
        >
          <FormControl isRequired>
            <Skeleton isLoaded={!isLoadingProgramData}>
              <FormLabel
                size="sm"
                fontWeight="normal"
                color="gray"
              >
                {t('programForm.programName')}
              </FormLabel>
            </Skeleton>
            <Skeleton isLoaded={!isLoadingProgramData}>
              <Input
                placeholder={t('programForm.enterProgramTitle')}
                value={formState.programName || ''}
                onChange={(e) => onProgramNameChange(e.target.value)}
              />
            </Skeleton>
          </FormControl>

          <Skeleton isLoaded={!isLoadingProgramData}>
            <PartnerOrganizationField
              label={t('programForm.partnerOrgName')}
              valueId={formState.partnerOrg}
              onChangeId={(id) =>
                setFormState((prev) => ({ ...prev, partnerOrg: id }))
              }
            />
          </Skeleton>

          <FormControl>
            <Skeleton
              isLoaded={!isLoadingProgramData}
              fitContent
            >
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
            </Skeleton>
          </FormControl>

          <FormControl isRequired>
            <Skeleton isLoaded={!isLoadingProgramData}>
              <FormLabel
                size="sm"
                fontWeight="normal"
                color="gray"
              >
                {t('programForm.status')}
              </FormLabel>
            </Skeleton>
            <Skeleton isLoaded={!isLoadingProgramData}>
              <Select
                value={formState.status ?? ''}
                onChange={(e) => onProgramStatusChange(e.target.value)}
                placeholder={t('programForm.selectStatus')}
              >
                <option value="Active">{t('programForm.launched')}</option>
                <option value="Inactive">{t('programForm.developing')}</option>
              </Select>
            </Skeleton>
          </FormControl>

          <FormControl isRequired>
            <Skeleton isLoaded={!isLoadingProgramData}>
              <FormLabel
                size="sm"
                fontWeight="normal"
                color="gray"
              >
                {t('programForm.launchDate')}
              </FormLabel>
            </Skeleton>
            <Skeleton isLoaded={!isLoadingProgramData}>
              <Input
                type="date"
                placeholder={t('programForm.datePlaceholder')}
                value={formState.launchDate || ''}
                onChange={(e) => onProgramLaunchDateChange(e.target.value)}
              />
            </Skeleton>
          </FormControl>
        </VStack>
      </Box>

      <Skeleton isLoaded={!isLoadingProgramData}>
        <LocationLanguageSection
          formState={formState}
          setFormData={setFormState}
          languageOptions={languageOptions}
          onLanguagesChange={onLanguageChange}
        />
      </Skeleton>

      <Skeleton isLoaded={!isLoadingProgramData}>
        <StudentsInstrumentsSection
          formState={formState}
          setFormData={setFormState}
        />
      </Skeleton>

      <Skeleton isLoaded={!isLoadingProgramData}>
        <AssignedDirectorsSection
          regionId={formState.regionId}
          formState={formState}
          setFormData={setFormState}
        />
      </Skeleton>

      <Skeleton isLoaded={!isLoadingProgramData}>
        <ResourcesSection
          formState={formState}
          setFormData={setFormState}
          programId={programId}
          backend={backend}
          onOpenMediaModal={onOpenMediaModal}
          onSeeAllMedia={onSeeAllMedia}
        />
      </Skeleton>
    </>
  );
}
