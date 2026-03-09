import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { MdOutlineSubdirectoryArrowRight } from 'react-icons/md';
import { useState, useContext } from 'react';

import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  GridItem,
  Heading,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react';

import { BackendContext } from '../../contexts/BackendContext';

export const ForgotPassword = ({ setIsForgot }) => {
  const [, setSubmitted] = useState(false);
  const { backend } = useContext(BackendContext);
  const [errorMessage, setErrorMessage] = useState('');
  const auth = getAuth();
  const toast = useToast();

  const verifyEmail = async (email) => {
    setErrorMessage('');
    try {
      await backend.post('/gcf-users/verify-email', { email });
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
      toast({
        title: 'Email sent successfully!',
        description: 'Please check your email',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });

      setIsForgot(false);
    } catch {
      setErrorMessage('Invalid Email');
      toast({
        title: 'Email not found!',
        description: 'Please check your email address',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  };
  return (
    <GridItem>
      <Box
        w="546px"
        h="344px"
        mt="20%"
        padding="40px"
        borderRadius="12px"
        boxShadow="xl"
      >
        <Heading fontSize={'5xl'}>Forgot Password?</Heading>
        <form
          style={{ width: '70%' }}
          onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            verifyEmail(email);
          }}
        >
          <Stack mt="28px" spacing={7}>
            <FormControl w={'100%'} isInvalid={!!errorMessage}>
              <FormLabel fontSize="lg">Email</FormLabel>
              <Center>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  size={'lg'}
                  name="email"
                  isRequired
                  autoComplete="email"
                  padding="16px"
                  borderRadius="6px"
                  border="1px"
                  borderColor="gray.200"
                  onChange={() => setErrorMessage('')}
                />
              </Center>
              <FormErrorMessage>{errorMessage}</FormErrorMessage>
            </FormControl>

            <Center>
              <Button
                type="submit"
                size="lg"
                bg="black"
                color="white"
                borderRadius="6px"
                w="full"
                mt="18px"
                _hover={{ bg: 'gray.800' }}
              >
                <MdOutlineSubdirectoryArrowRight /> Submit
              </Button>
            </Center>
          </Stack>
        </form>
      </Box>
    </GridItem>
  );
};
