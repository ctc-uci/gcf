export function computeChangedFields(formData, initialFormData, t) {
  const mask = t('accountForm.passwordMaskStars');
  const changes = [];
  if (formData.first_name !== initialFormData.first_name) {
    changes.push({
      label: t('accountForm.fieldFirstName'),
      old: initialFormData.first_name,
      new: formData.first_name,
    });
  }
  if (formData.last_name !== initialFormData.last_name) {
    changes.push({
      label: t('accountForm.fieldLastName'),
      old: initialFormData.last_name,
      new: formData.last_name,
    });
  }
  if (formData.email !== initialFormData.email) {
    changes.push({
      label: t('accountForm.fieldEmail'),
      old: initialFormData.email,
      new: formData.email,
    });
  }
  if (formData.password && formData.password !== initialFormData.password) {
    changes.push({
      label: t('accountForm.fieldPassword'),
      old: initialFormData.password || mask,
      new: mask,
    });
  }
  if (formData.role !== initialFormData.role) {
    changes.push({
      label: t('accountForm.fieldRole'),
      old: initialFormData.role,
      new: formData.role,
      isBadge: true,
    });
  }
  const oldProgram =
    initialFormData.programs.length > 0
      ? initialFormData.programs[0]?.name
      : '';
  const newProgram =
    formData.programs.length > 0 ? formData.programs[0]?.name : '';
  if (oldProgram !== newProgram) {
    changes.push({
      label: t('accountForm.fieldProgram'),
      old: oldProgram || '',
      new: newProgram || '',
    });
  }
  const oldRegion =
    initialFormData.regions.length > 0 ? initialFormData.regions[0]?.name : '';
  const newRegion =
    formData.regions.length > 0 ? formData.regions[0]?.name : '';
  if (oldRegion !== newRegion) {
    changes.push({
      label: t('accountForm.fieldRegion'),
      old: oldRegion || '',
      new: newRegion || '',
    });
  }
  return changes;
}
