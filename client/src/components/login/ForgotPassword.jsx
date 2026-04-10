import { useContext, useMemo, useState } from 'react';

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
import { MdOutlineSubdirectoryArrowRight } from 'react-icons/md';
import { z } from 'zod';

import { BackendContext } from '../../contexts/BackendContext';

export const ForgotPassword = ({ setIsForgot }) => {
  const { t } = useTranslation();
  const forgotSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('validation.incorrectEmail')),
      }),
    [t]
  );
  const [, setSubmitted] = useState(false);
  const { backend } = useContext(BackendContext);
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

  const verifyEmail = async (email) => {
    setErrorMessage('');
    try {
      await backend.post('/gcf-users/verify-email', { email });
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
      toast({
        title: t('forgotPassword.emailSentTitle'),
        description: t('forgotPassword.emailSentDesc'),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });

      setIsForgot(false);
    } catch {
      setErrorMessage(t('forgotPassword.invalidEmail'));
      toast({
        title: t('forgotPassword.emailNotFoundTitle'),
        description: t('forgotPassword.emailNotFoundDesc'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  };

  const onSubmit = ({ email }) => {
    verifyEmail(email);
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
