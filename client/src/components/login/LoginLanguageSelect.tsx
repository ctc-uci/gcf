import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';

import { APP_LOCALES, type AppLocale } from '@/i18n';
import { useTranslation } from 'react-i18next';

const LOCALE_META: { code: AppLocale; labelKey: string; flag: string }[] = [
  { code: 'en', labelKey: 'languageSelector.english', flag: '🇺🇸' },
  { code: 'es', labelKey: 'languageSelector.spanish', flag: '🇪🇸' },
  { code: 'fr', labelKey: 'languageSelector.french', flag: '🇫🇷' },
  { code: 'zh', labelKey: 'languageSelector.chinese', flag: '🇨🇳' },
];

export function LoginLanguageSelect() {
  const { t, i18n: i18nInstance } = useTranslation();
  const value = APP_LOCALES.includes(i18nInstance.language as AppLocale)
    ? (i18nInstance.language as AppLocale)
    : 'en';

  const current =
    LOCALE_META.find((item) => item.code === value) ?? LOCALE_META[0];

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
        minW="160px"
      >
        <Menu placement="bottom-end">
          <MenuButton
            as={Button}
            size="sm"
            variant="ghost"
            w="100%"
            justifyContent="space-between"
            fontWeight="normal"
            px={3}
            py={2}
            h="auto"
            rightIcon={<ChevronDownIcon color="gray.600" />}
            _hover={{ bg: 'gray.50' }}
            _active={{ bg: 'gray.100' }}
          >
            <Text
              as="span"
              textAlign="left"
              noOfLines={1}
            >
              {current?.flag} {t(current?.labelKey ?? '')}
            </Text>
          </MenuButton>
          <MenuList
            py={1}
            minW="160px"
            zIndex={30}
          >
            {LOCALE_META.map((item) => (
              <MenuItem
                key={item.code}
                fontSize="sm"
                onClick={() => {
                  void i18nInstance.changeLanguage(item.code);
                }}
                bg={item.code === value ? 'teal.50' : undefined}
              >
                {item.flag} {t(item.labelKey)}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Box>
    </HStack>
  );
}
