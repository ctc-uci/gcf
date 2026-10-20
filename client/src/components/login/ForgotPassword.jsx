import { useMemo, useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react';

import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const ForgotPassword = ({ setIsForgot }) => {
  const { t } = useTranslation();
  const forgotSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('validation.incorrectEmail')),
      }),
    [t]
  );
  const [errorMessage, setErrorMessage] = useState('');
  const auth = getAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  const showSentToast = () =>
    toast({
      title: t('forgotPassword.emailSentTitle'),
      description: t('forgotPassword.emailSentDesc'),
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'bottom-right',
    });

  // The user is logged out here, so we can't call the (token-protected)
  // backend. Firebase sends the reset email directly. We deliberately show the
  // same success message whether or not the account exists so this page can't
  // be used to discover which emails are registered.
  const sendResetEmail = async (email) => {
    setErrorMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      showSentToast();
      setIsForgot(false);
    } catch (err) {
      const code = err?.code;

      if (code === 'auth/user-not-found') {
        showSentToast();
        setIsForgot(false);
        return;
      }

      if (code === 'auth/invalid-email') {
        setErrorMessage(t('forgotPassword.invalidEmail'));
        return;
      }

      toast({
        title: t('signup.errorTitle'),
        description: err?.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  };

  const onSubmit = ({ email }) => {
    sendResetEmail(email);
  };

  return (
    <Box
      w="100%"
      maxW="500px"
      p={10}
      borderRadius="xl"
      boxShadow="xl"
      bg="white"
    >
      <Heading
        fontWeight="bold"
        fontSize="3xl"
        mb={6}
      >
        {t('forgotPassword.title')}
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={5}>
          <FormControl isInvalid={!!errors.email || !!errorMessage}>
            <FormLabel fontWeight="bold">{t('common.email')}</FormLabel>
            <Input
              placeholder={t('login.emailPlaceholder')}
              type="email"
              size="lg"
              autoComplete="email"
              borderRadius="md"
              bg="gray.50"
              {...register('email', {
                onChange: () => setErrorMessage(''),
              })}
            />
            <FormErrorMessage>
              {errors.email?.message?.toString() || errorMessage}
            </FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            size="lg"
            bg="black"
            color="white"
            borderRadius="md"
            w="full"
            _hover={{ bg: 'gray.800' }}
          >
            {t('common.submit')}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
