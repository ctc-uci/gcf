import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, HStack, Select, Text } from '@chakra-ui/react';

import { toAppLocale, type AppLocale } from '@/i18n';
import { useTranslation } from 'react-i18next';

type Props = {
  onUserPickedLocale?: () => void;
};

const LOCALE_META: { code: AppLocale; labelKey: string; flag: string }[] = [
  { code: 'en', labelKey: 'languageSelector.english', flag: '🇺🇸' },
  { code: 'es', labelKey: 'languageSelector.spanish', flag: '🇪🇸' },
  { code: 'fr', labelKey: 'languageSelector.french', flag: '🇫🇷' },
  { code: 'zh', labelKey: 'languageSelector.chinese', flag: '🇨🇳' },
];

export function LoginLanguageSelect({ onUserPickedLocale }: Props) {
  const { t, i18n: i18nInstance } = useTranslation();
  const value: AppLocale = toAppLocale(i18nInstance.language) ?? 'en';

  return (
    <HStack
      spacing={3}
      align="center"
    >
      <Text
        fontSize="sm"
        fontWeight="medium"
        color="gray.700"
        whiteSpace="nowrap"
      >
        {t('languageSelector.label')}
      </Text>
      <Box
        bg="white"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        px={2}
        minW="160px"
      >
        <Select
          size="sm"
          variant="unstyled"
          value={value}
          icon={<ChevronDownIcon color="gray.600" />}
          onChange={(e) => {
            const next = e.target.value as AppLocale;
            onUserPickedLocale?.();
            void i18nInstance.changeLanguage(next);
          }}
          sx={{ pl: 2, pr: 6 }}
        >
          {LOCALE_META.map((item) => (
            <option
              key={item.code}
              value={item.code}
            >
              {item.flag} {t(item.labelKey)}
            </option>
          ))}
        </Select>
      </Box>
    </HStack>
  );
}
