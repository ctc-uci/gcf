import { useEffect, useMemo, useState } from 'react';

import { useDisclosure, useToast } from '@chakra-ui/react';

import { useAuthContext } from '@/contexts/hooks/useAuthContext';
import { useBackendContext } from '@/contexts/hooks/useBackendContext';
import { useRoleContext } from '@/contexts/hooks/useRoleContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

import { AccountFormDrawer } from './AccountFormDrawer';
import {
  AccountFormDeleteModal,
  AccountFormExitModal,
  AccountFormSaveReviewModal,
} from './AccountFormModals';
import { computeChangedFields } from './changedFields';
import { formStateToAuditSnapshot, INITIAL_FORM_STATE } from './constants';

export const AccountForm = ({ targetUser, isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const { backend } = useBackendContext();
  const { role } = useRoleContext();
  const userId = currentUser?.uid;
  const targetUserId = targetUser?.id;

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentPrograms, setCurrentPrograms] = useState(null);
  const [currentRegions, setCurrentRegions] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [profilePictureKey, setProfilePictureKey] = useState('');

  const exitModal = useDisclosure();
  const deleteModal = useDisclosure();
  const saveModal = useDisclosure();
  const auth = getAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
  const [initialFormData, setInitialFormData] = useState({
    ...INITIAL_FORM_STATE,
  });

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const changedFields = useMemo(
    () => computeChangedFields(formData, initialFormData, t),
    [formData, initialFormData, t]
  );

  // Reset form when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    setValidationErrors({});
    setShowPassword(false);
    setIsFullScreen(false);
    setProfilePictureUrl('');
    setProfilePictureKey('');

    if (!targetUser) {
      const newState = { ...INITIAL_FORM_STATE, programs: [], regions: [] };
      setFormData(newState);
      setInitialFormData(newState);
    } else {
      const editState = {
        first_name: targetUser.firstName ?? '',
        last_name: targetUser.lastName ?? '',
        role: targetUser.role ?? '',
        email: targetUser.email ?? '',
        password: '',
        programs: [],
        regions: [],
      };
      setFormData(editState);
      setInitialFormData(editState);

      if (!targetUser.email && targetUserId) {
        const fetchEmail = async () => {
          try {
            const response = await backend.get(
              `/gcf-users/admin/get-user/${targetUserId}`
            );
            const email = response.data.email ?? '';
            setFormData((prev) => ({ ...prev, email }));
            setInitialFormData((prev) => ({ ...prev, email }));
          } catch (error) {
            console.error('Error loading target user email', error);
          }
        };
        fetchEmail();
      }

      if (targetUser.picture) {
        const fetchPictureUrl = async () => {
          try {
            const urlResponse = await backend.get(
              `/images/url/${encodeURIComponent(targetUser.picture)}`
            );
            setProfilePictureUrl(urlResponse.data.url || '');
            setProfilePictureKey(targetUser.picture);
          } catch {
            // picture unavailable — leave blank
          }
        };
        fetchPictureUrl();
      }
    }
  }, [targetUser, targetUserId, backend, isOpen]);

  // Fetch programs and regions
  useEffect(() => {
    async function fetchPrograms() {
      try {
        let response;
        if (role === 'Regional Director') {
          response = await backend.get(
            `/regional-directors/me/${userId}/programs`
          );
        } else {
          response = await backend.get('/program');
        }
        setCurrentPrograms(response.data);
      } catch (error) {
        console.error('Error fetching programs', error);
      }
    }

    async function fetchRegions() {
      try {
        const response = await backend.get('/region');
        setCurrentRegions(response.data);
      } catch (error) {
        console.error('Error fetching regions', error);
      }
    }

    if (role && userId) {
      fetchPrograms();
      fetchRegions();
    }
  }, [backend, role, userId]);

  useEffect(() => {
    if (!targetUserId || !targetUser) return;

    if (targetUser.role === 'Program Director') {
      const fetchUserPrograms = async () => {
        try {
          const response = await backend.get(
            `/program-directors/me/${targetUserId}/program`
          );
          const program = response.data;
          setFormData((prev) => ({ ...prev, programs: [program] }));
          setInitialFormData((prev) => ({ ...prev, programs: [program] }));
        } catch (error) {
          console.error("Error fetching user's programs:", error);
        }
      };
      fetchUserPrograms();
    }

    if (targetUser.role === 'Regional Director') {
      const fetchUserRegion = async () => {
        try {
          const response = await backend.get(
            `/regional-directors/me/${targetUserId}`
          );
          const regionId = response.data.regionId;

          if (regionId && currentRegions) {
            const region = currentRegions.find(
              (r) => String(r.id) === String(regionId)
            );
            setFormData((prev) => ({
              ...prev,
              regions: region ? [region] : [],
            }));
            setInitialFormData((prev) => ({
              ...prev,
              regions: region ? [region] : [],
            }));
          }
        } catch (error) {
          console.error("Error fetching user's region:", error);
        }
      };
      fetchUserRegion();
    }
  }, [backend, targetUserId, targetUser, currentRegions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = true;
    if (!formData.last_name.trim()) errors.last_name = true;
    if (!formData.email.trim()) errors.email = true;
    if (!formData.role) errors.role = true;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClick = () => {
    if (!validate()) return;

    if (targetUserId && isDirty) {
      saveModal.onOpen();
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    saveModal.onClose();

    try {
      if (!targetUserId) {
        await handleCreateUser();
      } else {
        await handleUpdateUser();
      }
      toast({
        title: t('accountForm.saveSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving user: ', error);
      const errorMessage = error.response?.data?.error || error.message;

      if (
        errorMessage.includes('email-already-exists') ||
        errorMessage.includes('email address is already in use')
      ) {
        toast({
          title: t('accountForm.emailExistsTitle'),
          description: t('accountForm.emailExistsDesc'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: t('accountForm.errorTitle'),
          description: t('accountForm.errorWithMessage', {
            message: errorMessage,
          }),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logAccountChange = async (payload) => {
    try {
      await backend.post('/accountChange', payload);
    } catch (err) {
      console.error('Failed to log account change:', err);
    }
  };

  const handleProfilePictureUpload = async (uploadedFiles) => {
    if (!uploadedFiles?.length) return;

    const key = uploadedFiles[0].s3_key;

    try {
      const urlResponse = await backend.get(
        `/images/url/${encodeURIComponent(key)}`
      );
      const nextUrl = urlResponse.data.url || '';
      const prevKey = profilePictureKey || null;

      if (targetUserId) {
        await backend.post('/images/profile-picture', {
          key,
          userId: targetUserId,
        });

        await logAccountChange({
          user_id: String(targetUserId),
          author_id: String(userId),
          change_type: 'Update',
          old_values: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            picture: prevKey,
            bio: '',
          },
          new_values: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            picture: key,
            bio: '',
          },
          resolved: false,
          last_modified: new Date().toISOString(),
        });
      }

      setProfilePictureKey(key);
      setProfilePictureUrl(nextUrl);
    } catch (err) {
      console.error('Error saving profile picture:', err);
    }
  };

  const handleCreateUser = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.role ||
      !formData.email
    ) {
      throw new Error(t('accountForm.fillAllFields'));
    }

    const userData = {
      email: formData.email,
      firstName: formData.first_name,
      lastName: formData.last_name,
      role: formData.role,
      currentUserId: userId,
      programId:
        formData.programs.length > 0 ? Number(formData.programs[0].id) : null,
      regionId:
        formData.regions.length > 0 ? Number(formData.regions[0].id) : null,
    };
    const createRes = await backend.post(
      '/gcf-users/admin/create-user',
      userData
    );
    const newUserId = createRes.data?.uid;
    if (newUserId && userId) {
      await logAccountChange({
        user_id: String(newUserId),
        author_id: String(userId),
        change_type: 'Creation',
        old_values: null,
        new_values: userData,
        resolved: true,
        last_modified: new Date().toISOString(),
      });
    }
    await sendPasswordResetEmail(auth, formData.email);
  };

  const handleUpdateUser = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.role ||
      !formData.email
    ) {
      throw new Error(t('accountForm.fillAllFields'));
    }
    const userData = {
      email: formData.email,
      firstName: formData.first_name,
      lastName: formData.last_name,
      role: formData.role,
      currentUserId: userId,
      targetId: targetUserId,
      programId:
        formData.programs.length > 0 ? Number(formData.programs[0].id) : null,
      regionId:
        formData.regions.length > 0 ? Number(formData.regions[0].id) : null,
    };

    if (formData.password && formData.password.trim().length > 0) {
      userData.password = formData.password;
    }
    await backend.put('/gcf-users/admin/update-user', userData);

    if (userId) {
      await logAccountChange({
        user_id: String(targetUserId),
        author_id: String(userId),
        change_type: 'Update',
        old_values: formStateToAuditSnapshot(initialFormData, {
          currentUserId: userId,
          targetId: targetUserId,
        }),
        new_values: formStateToAuditSnapshot(formData, {
          currentUserId: userId,
          targetId: targetUserId,
        }),
        resolved: true,
        last_modified: new Date().toISOString(),
      });
    }
  };

  const handleCloseWithCheck = () => {
    if (isDirty) {
      exitModal.onOpen();
    } else {
      onClose();
    }
  };

  const confirmDelete = async () => {
    if (!targetUserId) return;

    setIsDeleting(true);
    try {
      if (userId) {
        await logAccountChange({
          user_id: String(targetUserId),
          author_id: String(userId),
          change_type: 'Deletion',
          old_values: formStateToAuditSnapshot(initialFormData, {
            currentUserId: userId,
            targetId: targetUserId,
          }),
          new_values: null,
          resolved: true,
          last_modified: new Date().toISOString(),
        });
      }
      try {
        await backend.delete(`/gcf-users/${targetUserId}`);
        toast({
          title: t('accountForm.deleteSuccess', {
            defaultValue: 'Account deleted',
          }),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (deleteErr) {
        const status = deleteErr.response?.status;
        const data = deleteErr.response?.data;
        if (status === 503 && data?.gcfUserDeleted) {
          toast({
            title: t('accountForm.deletePartialTitle', {
              defaultValue: 'Account removed from directory',
            }),
            description: t('accountForm.deletePartialDesc', {
              defaultValue:
                'The user was removed from the app, but their sign-in account could not be deleted automatically. You may need to remove it from Firebase or try again later.',
            }),
            status: 'warning',
            duration: 8000,
            isClosable: true,
          });
        } else {
          throw deleteErr;
        }
      }
      deleteModal.onClose();
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.error || error.message;
      toast({
        title: t('accountForm.errorTitle'),
        description: t('accountForm.errorWithMessage', {
          message: errorMessage,
        }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // "Created by" is the account record's creator when editing; when creating a new
  // user it is the current admin (the creator that will be stored on save).
  const isNewAccount = !targetUserId;
  const createdByName = isNewAccount
    ? currentUser?.displayName ||
      `${currentUser?.email?.split('@')[0] || t('common.unknownUser')}`
    : targetUser?.createdBy?.trim() || t('common.emDash');
  const createdByPicture = isNewAccount
    ? ''
    : targetUser?.createdByPicture || '';
  const creatorPhotoUrl = isNewAccount ? currentUser?.photoURL || '' : '';

  const errorBorderProps = (field) =>
    validationErrors[field]
      ? {
          borderColor: 'red.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-red-500)',
        }
      : {};

  return (
    <>
      <AccountFormDrawer
        isOpen={isOpen}
        onClose={handleCloseWithCheck}
        isFullScreen={isFullScreen}
        onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        formData={formData}
        onChange={handleChange}
        errorBorderProps={errorBorderProps}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword(!showPassword)}
        targetUserId={targetUserId}
        viewerRole={role}
        currentPrograms={currentPrograms}
        currentRegions={currentRegions}
        setFormData={setFormData}
        createdByName={createdByName}
        createdByPicture={createdByPicture}
        creatorPhotoUrl={creatorPhotoUrl}
        isNewAccount={isNewAccount}
        onDeleteClick={() => deleteModal.onOpen()}
        onCancel={handleCloseWithCheck}
        onSave={handleSaveClick}
        isLoading={isLoading}
        profilePictureUrl={profilePictureUrl}
        onProfilePictureUpload={handleProfilePictureUpload}
      />

      <AccountFormExitModal
        isOpen={exitModal.isOpen}
        onClose={exitModal.onClose}
        onExitWithoutSaving={() => {
          exitModal.onClose();
          onClose();
        }}
      />

      <AccountFormDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onConfirmDelete={confirmDelete}
        isDeleting={isDeleting}
      />

      <AccountFormSaveReviewModal
        isOpen={saveModal.isOpen}
        onClose={saveModal.onClose}
        changedFields={changedFields}
        onConfirm={handleSubmit}
        isLoading={isLoading}
      />
    </>
  );
};
