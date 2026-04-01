import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';

import { CookiesProvider } from 'react-cookie';

import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { BackendProvider } from './contexts/BackendContext.tsx';
import { RoleProvider } from './contexts/RoleContext.tsx';
import { initI18n } from './i18n.ts';

const colors = {
  brand: {},
};

const theme = extendTheme({ colors });

const rootEl = document.getElementById('root')!;

void initI18n()
  .catch((err) => {
    console.error('Failed to initialize i18n:', err);
  })
  .finally(() => {
    createRoot(rootEl).render(
      <StrictMode>
        <CookiesProvider>
          <BackendProvider>
            <AuthProvider>
              <RoleProvider>
                <ChakraProvider theme={theme}>
                  <App />
                </ChakraProvider>
              </RoleProvider>
            </AuthProvider>
          </BackendProvider>
        </CookiesProvider>
      </StrictMode>
    );
  });
