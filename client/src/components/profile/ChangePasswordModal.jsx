import { useState } from 'react'

import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, FormControl, FormLabel,
  Input, InputGroup, InputRightElement, IconButton, Text, useToast
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';

export const ChangePasswordModal = ({ isOpen, onClose, newPassword, currentUser, onSuccess}) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

const handleClose = () => {
  setCurrentPassword('');
  setConfirmPassword('');
  setError('');
  onClose();
};

    const handleConfirm = async () => {
        setError('')
        if (confirmPassword !== newPassword) {
            toast({
                title: 'Incorrect Confirmation Password',
                description: 'New Password and Confirmation of new password do not match',
                status: 'error',
                variant: 'subtle',
                position: 'bottom-right',
            });
            return;
        }
        setLoading(true)
        try {

            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            onSuccess();
        } catch (err) {
            console.log(err)
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                toast({
                    title: 'Incorrect password',
                    description: 'Please check your password input',
                    status: 'error',
                    variant: 'subtle',
                    position: 'bottom-right',
                });
            } else {
                toast({
                    title: 'Something went wrong',
                    description: 'Please try again later.',
                    status: 'error',
                    variant: 'subtle',
                    position: 'bottom-right',
                });
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Confirm Password Change</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <FormControl>
                    <FormLabel fontWeight="bold">Current Password</FormLabel>
                    <InputGroup>
                        <Input
                            type={showCurrent ? 'text': 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <InputRightElement>
                        <IconButton
                            icon={showCurrent ? <FiEye /> : <FiEyeOff />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCurrent(!showCurrent)}
                        />
                        </InputRightElement>
                    </InputGroup>
                    <FormLabel fontWeight="bold" mt={4}>Confirm New Password</FormLabel>
                    <InputGroup>
                        <Input
                            type={showNew ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <InputRightElement>
                            <IconButton
                            icon={showNew ? <FiEye /> : <FiEyeOff />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowNew(!showNew)}
                            />
                        </InputRightElement>
                    </InputGroup>
                </FormControl>
            </ModalBody>
            <ModalFooter gap={3}>
                <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                <Button bg="teal.500" color="white" _hover={{ bg: 'teal.600' }} onClick={handleConfirm} isLoading={loading}>
                    Save
                </Button>
            </ModalFooter>
        </ModalContent>
        </Modal>
    );
}