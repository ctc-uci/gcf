import { useEffect, useMemo } from 'react';

import {
  Button,
  Center,
  Link as ChakraLink,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Input,
  Select,
  Stack,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// import { FaGoogle } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

type SignupFormValues = {
  email: string;
  password: string;
  role: 'Regional Director' | 'Program Director' | 'Admin';
};

export const Signup = () => {
  const { t } = useTranslation();
  const signupSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('validation.invalidEmail')),
        password: z.string().min(6, t('validation.passwordMin')),
        role: z.enum(['Regional Director', 'Program Director', 'Admin'], {
          required_error: t('validation.selectRole'),
        }),
      }),
    [t]
  );
  const navigate = useNavigate();
  const toast = useToast();
  const { signup, handleRedirectResult } = useAuthContext();
  const { backend } = useBackendContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const handleSignup = async (data: SignupFormValues) => {
    try {
      const user = await signup({
        email: data.email,
        password: data.password,
        role: data.role,
      });

      if (user) {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        toast({
          title: t('signup.errorTitle'),
          description: err.message,
          status: 'error',
          variant: 'subtle',
        });
      }
    }
  };

  useEffect(() => {
    handleRedirectResult(backend, navigate, toast);
  }, [backend, handleRedirectResult, navigate, toast]);

  return (
    <VStack
      spacing={8}
      sx={{ width: 300, marginX: 'auto' }}
    >
      <Heading>{t('signup.title')}</Heading>

      <form
        onSubmit={handleSubmit(handleSignup)}
        style={{ width: '100%' }}
      >
        <Stack spacing={2}>
          <FormControl
            isInvalid={!!errors.email}
            w={'100%'}
          >
            <Center>
              <Input
                placeholder={t('signup.emailPlaceholder')}
                type="email"
                size={'lg'}
                {...register('email')}
                name="email"
                isRequired
                autoComplete="email"
              />
            </Center>
            <FormErrorMessage>
              {errors.email?.message?.toString()}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <Center>
              <Input
                placeholder={t('signup.passwordPlaceholder')}
                type="password"
                size={'lg'}
                {...register('password')}
                name="password"
                isRequired
                autoComplete="password"
              />
            </Center>
            <FormErrorMessage>
              {errors.password?.message?.toString()}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.role}>
            <Center>
              <Select
                placeholder={t('signup.selectRolePlaceholder')}
                size={'lg'}
                {...register('role')}
                name="role"
                isRequired
              >
                <option value="Admin">{t('signup.roleAdmin')}</option>
                <option value="Regional Director">
                  {t('signup.roleRegionalDirector')}
                </option>
                <option value="Program Director">
                  {t('signup.roleProgramDirector')}
                </option>
              </Select>
            </Center>
            <FormErrorMessage>
              {errors.role?.message?.toString()}
            </FormErrorMessage>
            <ChakraLink
              as={Link}
              to="/login"
            >
              <FormHelperText>{t('signup.loginHint')}</FormHelperText>
            </ChakraLink>
          </FormControl>

          <Button
            type="submit"
            size={'lg'}
            sx={{ width: '100%' }}
            isDisabled={Object.keys(errors).length > 0}
          >
            {t('common.signup')}
          </Button>
        </Stack>
      </form>

      {/* <Button
        leftIcon={<FaGoogle />}
        variant={"solid"}
        size={"lg"}
        onClick={handleGoogleSignup}
        sx={{ width: "100%" }}
      >
        Signup with Google
      </Button> */}
    </VStack>
  );
};
