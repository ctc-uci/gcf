import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const CatchAll = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  return <p>{t('catchAll.redirecting')}</p>;
};
