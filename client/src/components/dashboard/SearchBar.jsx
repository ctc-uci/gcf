import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

function SearchBar({ text, onChange }) {
  const { t } = useTranslation();
  return (
    <InputGroup>
      <InputLeftElement></InputLeftElement>
      <Input
        placeholder={t('searchBar.placeholder')}
        text={text}
        onChange={(e) => onChange(e.target.value)}
      />
    </InputGroup>
  );
}

export default SearchBar;
