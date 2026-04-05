import { Button } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

export function FullscreenFlyoutButton(props) {
  const { t } = useTranslation();
  const {
    isFullScreen,
    toggleFullScreen,
    marginLeft,
    marginTop,
    width,
    height,
  } = props;
  return (
    <Button
      onClick={toggleFullScreen}
      aria-label={isFullScreen ? t('common.minimize') : t('common.expand')}
      variant="outline"
      size="sm"
      marginLeft={marginLeft}
      marginTop={marginTop}
      width={width}
      height={height}
    >
      {isFullScreen ? t('common.minimize') : t('common.expand')}
    </Button>
  );
}
