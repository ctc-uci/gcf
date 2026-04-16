/** Deletes instrument_change rows for this program + instrument (same as ProgramUpdateForm). */
export async function deleteInstrumentChangesForProgramInstrument(
  backend,
  programId,
  instrumentId
) {
  const numericProgramId = Number(programId);
  const numericInstrumentId = Number(instrumentId);
  if (Number.isNaN(numericInstrumentId)) return;

  const res = await backend.get('/program-updates');
  const updates = Array.isArray(res.data) ? res.data : [];
  const updateIds = updates
    .filter((u) => Number(u.programId ?? u.program_id) === numericProgramId)
    .map((u) => u.id);

  for (const updateId of updateIds) {
    const icRes = await backend.get(`/instrument-changes/update/${updateId}`);
    const rows = Array.isArray(icRes.data) ? icRes.data : [];
    for (const row of rows) {
      const iid = Number(row.instrumentId ?? row.instrument_id);
      if (
        iid === numericInstrumentId &&
        row.id !== null &&
        row.id !== undefined
      ) {
        await backend.delete(`/instrument-changes/${row.id}`);
      }
    }
  }
}

export function removeFormItemByIdOrKey(list, item) {
  return (list ?? []).filter((m) => {
    const itemHasId = item.id !== null && item.id !== undefined;
    const mHasId = m.id !== null && m.id !== undefined;
    if (itemHasId && mHasId) return Number(m.id) !== Number(item.id);
    if (item.s3_key && m.s3_key) return m.s3_key !== item.s3_key;
    return m !== item;
  });
}

export function isPdfByType(media) {
  return media.file_type === 'application/pdf';
}
