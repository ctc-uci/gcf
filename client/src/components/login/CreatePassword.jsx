import { useMemo, useState } from 'react';

import {
  Box,
  Button,
  Link as ChakraLink,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react';

import { zodResolver } from '@hookform/resolvers/zod';
import { confirmPasswordReset, getAuth } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdOutlineSubdirectoryArrowRight } from 'react-icons/md';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

export const CreatePassword = () => {
  const { t } = useTranslation();
  const createPasswordSchema = useMemo(
    () =>
      z
        .object({
          newPassword: z.string().min(6, t('validation.passwordMin')),
          confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t('validation.passwordsNoMatch'),
          path: ['confirmPassword'],
        }),
    [t]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = getAuth();

  const oobCode = searchParams.get('oobCode');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPasswordSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data) => {
    if (!oobCode) {
      toast({
        title: t('createPassword.invalidLinkTitle'),
        description: t('createPassword.invalidLinkDesc'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, data.newPassword);

      toast({
        title: t('createPassword.successTitle'),
        description: t('createPassword.successDesc'),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      navigate('/login');
    } catch (error) {
      toast({
        title: t('createPassword.errorTitle'),
        description: error.message || t('validation.passwordsNoMatch'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      w="450px"
      bg="white"
      padding="40px"
      borderRadius="12px"
      boxShadow="xl"
    >
      <Heading
        fontSize="3xl"
        mb={6}
        fontWeight="bold"
      >
        {t('createPassword.title')}
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={5}>
          <FormControl isInvalid={!!errors.newPassword}>
            <FormLabel fontWeight="bold">
              {t('createPassword.newPassword')}
            </FormLabel>
            <Input
              type="password"
              placeholder={t('createPassword.passwordDots')}
              {...register('newPassword')}
              size="lg"
              borderRadius="6px"
              borderColor={errors.newPassword ? 'red.500' : 'gray.200'}
              _focus={{ borderColor: 'blue.400' }}
            />
            <FormErrorMessage color="red.500">
              {errors.newPassword?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormLabel fontWeight="bold">
              {t('createPassword.confirmPassword')}
            </FormLabel>
            <Input
              type="password"
              placeholder={t('createPassword.passwordDots')}
              {...register('confirmPassword')}
              size="lg"
              borderRadius="6px"
              borderColor={errors.confirmPassword ? 'red.500' : 'gray.200'}
              _focus={{ borderColor: 'blue.400' }}
            />
            <FormErrorMessage color="red.500">
              {errors.confirmPassword?.message}
            </FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            size="lg"
            bg="black"
            color="white"
            borderRadius="6px"
            w="full"
            mt={2}
            isLoading={isSubmitting}
            _hover={{ bg: 'gray.800' }}
          >
            <MdOutlineSubdirectoryArrowRight style={{ marginRight: '8px' }} />{' '}
            {t('common.submit')}
          </Button>

          <Box
            textAlign="right"
            mt={2}
          >
            <ChakraLink
              color="blue.600"
              textDecoration="underline"
              fontSize="sm"
              onClick={() => navigate('/login?mode=forgotPassword')}
            >
              {t('createPassword.forgotLink')}
            </ChakraLink>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};
