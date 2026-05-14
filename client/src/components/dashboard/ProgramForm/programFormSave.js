import { deleteInstrumentChangesForProgramInstrument } from './programFormHelpers';

export async function saveProgramForm({
  backend,
  currentUser,
  program,
  formState,
  initialProgramDirectorIds,
  setInitialProgramDirectorIds,
  initialInstrumentQuantities,
  initialCurriculumLinks,
  initialGraduated,
  onSave,
  onClose,
}) {
  const rawPartner = formState.partnerOrg;
  const hasPartnerOrg =
    rawPartner !== null && rawPartner !== undefined && rawPartner !== '';
  const partnerOrgPayload = hasPartnerOrg
    ? Number(rawPartner)
    : program
      ? null
      : 1;

  const data = {
    name: formState.programName,
    title: formState.programName,
    status: formState.status,
    launchDate: formState.launchDate,
    country: formState.country,
    state: formState.state,
    city: formState.city,
    students: formState.students ?? 0,
    languages: formState.languages ?? [],
    partnerOrg: partnerOrgPayload,
    createdBy: currentUser?.uid || currentUser?.id,
    description: '',
  };

  let programId;
  const oldStudentCount = program?.students || 0;
  const deltaNet = (formState.students ?? 0) - oldStudentCount;
  const deltaGrad = (formState.graduatedStudents ?? 0) - initialGraduated;
  const enrollmentDelta = deltaNet + deltaGrad;
  const graduatedDelta = deltaGrad;

  if (program) {
    await backend.put(`/program/${program.id}`, data);
    programId = program.id;
  } else {
    const response = await backend.post(`/program`, data);
    programId = response.data.id;
  }

  const selectedDirectors = formState.programDirectors ?? [];
  const selectedIds = selectedDirectors
    .map((d) => d?.userId)
    .filter(
      (id) => id !== null && id !== undefined && String(id).trim() !== ''
    );
  const selectedKeySet = new Set(selectedIds.map((id) => String(id).trim()));

  const initialIds = initialProgramDirectorIds || [];
  const initialKeySet = new Set(
    initialIds
      .filter((id) => id !== null && id !== undefined)
      .map((id) => String(id).trim())
  );

  for (const uid of initialIds) {
    const key = String(uid ?? '').trim();
    if (key && !selectedKeySet.has(key)) {
      await backend.delete(`/program-directors/${encodeURIComponent(key)}`, {
        params: { programId },
      });
    }
  }

  for (const uid of selectedIds) {
    const key = String(uid).trim();
    if (key && !initialKeySet.has(key)) {
      await backend.post(`/program-directors`, { userId: uid, programId });
    }
  }

  setInitialProgramDirectorIds(selectedIds);

  const currentLinkKeys = (formState.curriculumLinks ?? []).map(
    (p) => `${p.link}\0${p.instrumentId}`
  );
  for (const playlist of formState.curriculumLinks ?? []) {
    const key = `${playlist.link}\0${playlist.instrumentId}`;
    if (
      !initialCurriculumLinks.some(
        (i) => `${i.link}\0${i.instrumentId}` === key
      )
    ) {
      await backend.post(`/program/${programId}/playlists`, {
        link: playlist.link,
        name: playlist.name || 'Playlist',
        instrumentId: playlist.instrumentId,
      });
    }
  }
  for (const old of initialCurriculumLinks) {
    if (!currentLinkKeys.includes(`${old.link}\0${old.instrumentId}`)) {
      await backend.delete(`/program/${programId}/playlists`, {
        data: { link: old.link, instrumentId: old.instrumentId },
      });
    }
  }

  const currentMediaIds = formState.media
    .map((m) => m.id)
    .filter((id) => id !== undefined && id !== null);
  const currentFileIds = formState.fileChanges
    .map((f) => f.id)
    .filter((id) => id !== undefined && id !== null);

  const pendingMedia = formState.media.filter((m) => !m.id);
  const pendingFiles = formState.fileChanges.filter((f) => !f.id);

  if (program) {
    const programMedia = program?.media ?? [];
    const mediaToDelete = programMedia.filter(
      (oldMedia) =>
        oldMedia.id !== null &&
        oldMedia.id !== undefined &&
        !currentMediaIds.includes(oldMedia.id)
    );

    for (const media of mediaToDelete) {
      if (media.id) {
        await backend.delete(`/mediaChange/${media.id}`);
      }
    }

    const programFiles = program?.fileChanges ?? [];
    const filesToDelete = programFiles.filter(
      (oldFile) =>
        oldFile.id !== null &&
        oldFile.id !== undefined &&
        !currentFileIds.includes(oldFile.id)
    );

    for (const file of filesToDelete) {
      if (file.id) {
        await backend.delete(`/fileChanges/${file.id}`);
      }
    }
  }

  const instrumentChanges = [];
  const instrumentIdsToPurge = [];

  const allInstrumentIds = new Set([
    ...Object.keys(initialInstrumentQuantities || {}),
    ...Object.keys(formState.instruments || {}),
  ]);

  for (const id of allInstrumentIds) {
    const newQty = formState.instruments?.[id]?.quantity ?? 0;
    const oldQty = initialInstrumentQuantities?.[id] ?? 0;
    if (program && newQty === 0 && oldQty > 0) {
      instrumentIdsToPurge.push(Number(id));
      continue;
    }
    const instrumentDiff = newQty - oldQty;
    if (instrumentDiff !== 0) {
      instrumentChanges.push({
        instrumentId: Number(id),
        amountChanged: instrumentDiff,
      });
    }
  }

  if (program && instrumentIdsToPurge.length > 0) {
    for (const instId of instrumentIdsToPurge) {
      await deleteInstrumentChangesForProgramInstrument(
        backend,
        programId,
        instId
      );
    }
  }

  const hasStudentChange = enrollmentDelta !== 0 || graduatedDelta !== 0;
  const hasInstrumentChange = instrumentChanges.length > 0;
  const hasMediaChange = pendingMedia.length > 0 || pendingFiles.length > 0;

  const isNewProgram = !program;

  if (
    isNewProgram ||
    hasStudentChange ||
    hasInstrumentChange ||
    hasMediaChange
  ) {
    const updateResponse = await backend.post(`/program-updates`, {
      title: isNewProgram ? 'Program Created' : 'update program stats',
      program_id: programId,
      created_by: currentUser?.uid || currentUser?.id,
      update_date: new Date().toISOString(),
      note: isNewProgram ? 'Program Created' : 'Program update',
      show_on_table: isNewProgram,
      resolved: true,
      show_on_table: false,
    });

    const updateId = updateResponse.data.id;
    if (hasStudentChange) {
      await backend.post(`/enrollmentChange`, {
        update_id: updateId,
        enrollment_change: enrollmentDelta,
        graduated_change: graduatedDelta,
        event_type: 'other',
        show_on_table: false,
        resolved: true,
      });
    }
    if (hasInstrumentChange) {
      for (const instrumentChange of instrumentChanges) {
        await backend.post(`/instrument-changes`, {
          instrumentId: instrumentChange.instrumentId,
          updateId,
          amountChanged: instrumentChange.amountChanged,
          event_type: 'other',
          show_on_table: false,
          resolved: true,
        });
      }
    }
    if (hasMediaChange) {
      for (const fileChange of pendingFiles) {
        await backend.post(`/fileChanges`, {
          update_id: updateId,
          s3_key: fileChange.s3_key,
          file_name: fileChange.file_name,
          file_type: fileChange.file_type,
        });
      }
      for (const mediaChange of pendingMedia) {
        await backend.post(`/mediaChange`, {
          update_id: updateId,
          s3_key: mediaChange.s3_key,
          file_name: mediaChange.file_name,
          file_type: mediaChange.file_type,
          is_thumbnail: false,
        });
      }
    }
  }

  onSave?.();
  onClose();
}
