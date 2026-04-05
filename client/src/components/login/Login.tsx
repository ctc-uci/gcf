import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Image,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import i18n, { isAppLocale } from '@/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa6';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { CreatePassword } from './CreatePassword';
import { ForgotPassword } from './ForgotPassword';
import { LoginLanguageSelect } from './LoginLanguageSelect';
import GcfGlobe from '/gcf_globe.png';

type SigninFormValues = {
  email: string;
  password: string;
};

export const Login = () => {
  const { t } = useTranslation();
  const welcomeTexts = useMemo(
    () => t('login.welcome', { returnObjects: true }) as string[],
    [t]
  );
  const signinSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('validation.incorrectEmail')),
        password: z.string().min(6, t('validation.incorrectPassword')),
      }),
    [t]
  );
  const [isForgot, setIsForgot] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [textIndex, setTextIndex] = useState(0);

  const { login, handleRedirectResult } = useAuthContext();
  const { backend } = useBackendContext();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    mode: 'onBlur',
  });

  // Welcome text cycling animation
  useEffect(() => {
    if (welcomeTexts.length === 0) return;
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % welcomeTexts.length);
    }, 1300); // 1000ms display + 300ms animation
    return () => clearInterval(interval);
  }, [welcomeTexts.length]);

  const toastLoginError = useCallback(
    (msg: string) => {
      toast({
        title: t('login.toastCouldNotLogin'),
        description: msg,
        status: 'error',
        variant: 'subtle',
        position: 'bottom-right',
      });
    },
    [toast, t]
  );

  const handleLogin = async (data: SigninFormValues) => {
    try {
      const cred = await login({
        email: data.email,
        password: data.password,
      });

      try {
        const { data: userRow } = await backend.get(
          `/gcf-users/${cred.user.uid}`
        );
        if (
          userRow?.preferredLanguage &&
          isAppLocale(String(userRow.preferredLanguage))
        ) {
          await i18n.changeLanguage(String(userRow.preferredLanguage));
        }
      } catch {
        /* keep locale from login screen */
      }

      navigate('/dashboard/1');
    } catch (err: unknown) {
      const errorCode =
        err && typeof err === 'object' && 'code' in err
          ? (err as { code?: string }).code
          : undefined;

      switch (errorCode) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-email':
        case 'auth/user-not-found':
          setError('email', { message: t('validation.incorrectEmail') });
          setError('password', { message: t('validation.incorrectPassword') });
          toastLoginError(t('login.incorrectLogin'));
          break;
        case 'auth/unverified-email':
          toastLoginError(t('login.verifyEmail'));
          break;
        case 'auth/user-disabled':
          toastLoginError(t('login.accountDisabled'));
          break;
        case 'auth/too-many-requests':
          toastLoginError(t('login.tooManyRequests'));
          break;
        case 'auth/user-signed-out':
          toastLoginError(t('login.signedOut'));
          break;
        default:
          toastLoginError(
            err instanceof Error ? err.message : t('signup.errorTitle')
          );
      }
    }
  };

  useEffect(() => {
    handleRedirectResult(backend, navigate, toast);
  }, [backend, handleRedirectResult, navigate, toast]);

  return (
    <Grid
      position="relative"
      templateColumns="repeat(2, 1fr)"
      h="100vh"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={4}
        right={6}
        zIndex={20}
      >
        <LoginLanguageSelect />
      </Box>
      <GridItem>
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="100%"
          borderRight="none"
          position="relative"
          overflow="hidden"
        >
          <Box
            mb={6}
            h="60px"
            display="flex"
            alignItems="center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={textIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  ease: [0.7, -0.4, 0.4, 1.4],
                  delay: textIndex === 0 ? 0 : undefined,
                }}
              >
                <Heading
                  fontWeight="bold"
                  fontSize="5xl"
                  textAlign="center"
                >
                  {welcomeTexts[textIndex]}
                </Heading>
              </motion.div>
            </AnimatePresence>
          </Box>
          <Image
            src={GcfGlobe}
            alt={t('login.gcfGlobeAlt')}
            maxH="55%"
            draggable="false"
          />
        </Flex>
      </GridItem>
      {mode === 'resetPassword' ? (
        <GridItem
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
          bg="#D6F1EF"
        >
          <IconButton
            aria-label={t('login.backToLogin')}
            icon={<FaArrowLeft />}
            position="absolute"
            top={8}
            left={8}
            onClick={() => {
              searchParams.delete('mode');
              navigate({ search: searchParams.toString() });
            }}
            bg="gray.200"
            borderRadius="md"
            _hover={{ bg: 'gray.300' }}
          />
          <CreatePassword />
        </GridItem>
      ) : isForgot ? (
        <GridItem
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
          bg="#D6F1EF"
        >
          <IconButton
            aria-label={t('login.backToLogin')}
            icon={<FaArrowLeft />}
            position="absolute"
            top={8}
            left={8}
            onClick={() => setIsForgot(false)}
            bg="gray.200"
            borderRadius="md"
            _hover={{ bg: 'gray.300' }}
          />
          <ForgotPassword setIsForgot={setIsForgot} />
        </GridItem>
      ) : (
        <GridItem bg="#D6F1EF">
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="100%"
            px={12}
          >
            <Box
              bg="white"
              borderRadius="xl"
              p={10}
              w="100%"
              maxW="500px"
              boxShadow="xl"
            >
              <Heading
                fontWeight="bold"
                fontSize="3xl"
                mb={6}
              >
                {t('login.title')}
              </Heading>

              <form onSubmit={handleSubmit(handleLogin)}>
                <Stack spacing={5}>
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel fontWeight="bold">{t('common.email')}</FormLabel>
                    <Input
                      placeholder={t('login.emailPlaceholder')}
                      type="email"
                      size="lg"
                      {...register('email')}
                      name="email"
                      isRequired
                      autoComplete="email"
                      borderRadius="md"
                      bg="gray.50"
                    />
                    <FormErrorMessage>
                      {errors.email?.message?.toString()}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel fontWeight="bold">
                      {t('common.password')}
                    </FormLabel>
                    <Input
                      placeholder={t('login.passwordPlaceholder')}
                      type="password"
                      size="lg"
                      {...register('password')}
                      name="password"
                      isRequired
                      autoComplete="current-password"
                      borderRadius="md"
                      bg="gray.50"
                    />
                    <FormErrorMessage>
                      {errors.password?.message?.toString()}
                    </FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    isDisabled={Object.keys(errors).length > 0}
                    bg="black"
                    color="white"
                    borderRadius="md"
                    w="100%"
                    _hover={{ bg: 'gray.800' }}
                  >
                    {t('common.login')}
                  </Button>
                  <Box textAlign="right">
                    <Button
                      type="button"
                      variant="link"
                      color="teal.900"
                      fontSize="lg"
                      fontWeight="normal"
                      textDecoration="underline"
                      p={0}
                      h="auto"
                      minH={0}
                      lineHeight="normal"
                      onClick={() => setIsForgot(true)}
                    >
                      {t('login.forgotPassword')}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Box>
          </Flex>
        </GridItem>
      )}
    </Grid>
  );
};
