import { DiffField } from './DiffField';

export const RoleSpecificDetails = ({
  fields,
  changeType,
  roleDiffers,
  programOldDisplay,
  regionOldDisplay,
  bioOldDisplay,
  newRoleNorm,
  t,
}) => {
  if (newRoleNorm === 'Program Director') {
    return (
      <>
        <DiffField
          label={t('common.program')}
          oldValue={programOldDisplay}
          newValue={fields.newProg}
          changeType={changeType}
          hasChangeOverride={roleDiffers ? undefined : fields.progById}
        />
        <DiffField
          label={t('common.biography')}
          oldValue={bioOldDisplay}
          newValue={fields.newBio}
          changeType={changeType}
        />
      </>
    );
  }

  if (newRoleNorm === 'Regional Director') {
    return (
      <>
        <DiffField
          label={t('common.region')}
          oldValue={regionOldDisplay}
          newValue={fields.newReg}
          changeType={changeType}
          hasChangeOverride={roleDiffers ? undefined : fields.regById}
        />
      </>
    );
  }

  return null;
};
