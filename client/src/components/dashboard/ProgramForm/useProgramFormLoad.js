import { useEffect } from 'react';

import ISO6391 from 'iso-639-1';

export const emptyFormState = {
  status: null,
  programName: null,
  partnerOrg: null,
  showPartnerOrgOnMap: false,
  launchDate: null,
  regionId: null,
  country: null,
  countryIsoCode: null,
  city: null,
  state: null,
  students: 0,
  graduatedStudents: 0,
  instruments: {},
  languages: [],
  programDirectors: [],
  curriculumLinks: [],
  media: [],
  fileChanges: [],
};

export function useProgramFormLoad({
  program,
  backend,
  setFormState,
  setInitialProgramDirectorIds,
  setInitialInstrumentQuantities,
  setInitialCurriculumLinks,
  setInitialUploadedMedia,
  setInitialGraduated,
  setIsLoadingProgramData,
}) {
  useEffect(() => {
    let cancelled = false;

    async function loadProgramRegionData() {
      if (!program) {
        setIsLoadingProgramData(false);
        setFormState(emptyFormState);
        setInitialProgramDirectorIds([]);
        setInitialInstrumentQuantities({});
        setInitialCurriculumLinks([]);
        setInitialUploadedMedia([]);
        setInitialGraduated(0);
        return;
      }

      setIsLoadingProgramData(true);

      let record = program;
      try {
        const { data } = await backend.get(`/program/${program.id}`);
        record = {
          ...program,
          ...data,
          programDirectors: program.programDirectors ?? [],
          regionalDirectors: program.regionalDirectors ?? [],
          playlists: program.playlists ?? [],
          media: program.media ?? [],
          fileChanges: program.fileChanges ?? [],
        };
      } catch (err) {
        console.error('ProgramForm: could not load program details', err);
      }

      try {
        const mediaRes = await backend.get(`/program/${program.id}/media`);
        if (Array.isArray(mediaRes.data)) {
          record = { ...record, media: mediaRes.data };
        }
      } catch (err) {
        console.error('ProgramForm: could not load program media', err);
      }

      try {
        const filesRes = await backend.get(
          `/fileChanges/program/${program.id}`
        );
        if (Array.isArray(filesRes.data)) {
          record = { ...record, fileChanges: filesRes.data };
        }
      } catch (err) {
        console.error('ProgramForm: could not load program file changes', err);
      }

      try {
        const pdRes = await backend.get(
          `/program/${program.id}/program-directors`
        );
        if (Array.isArray(pdRes.data)) {
          record = { ...record, programDirectors: pdRes.data };
        }
      } catch (err) {
        console.error('ProgramForm: could not load program directors', err);
      }

      let regionId = null;
      let countryIsoCode = null;

      if (record.country) {
        try {
          const countryResponse = await backend.get(
            `/country/${record.country}`
          );
          regionId = countryResponse.data.regionId;
          const rawIso =
            countryResponse.data.isoCode ?? countryResponse.data.iso_code;
          if (
            rawIso !== null &&
            rawIso !== undefined &&
            String(rawIso).trim() !== ''
          ) {
            countryIsoCode = String(rawIso).trim().toUpperCase();
          }
        } catch (error) {
          console.error('error fetching country/region', error);
        }
      }

      const mappedProgramDirectors = (record.programDirectors ?? []).map(
        (d) => ({
          userId: d.userId ?? d.id ?? d.user_id,
          firstName: d.firstName,
          lastName: d.lastName,
          picture: d.picture,
        })
      );
      const programDirectorsForForm = mappedProgramDirectors.slice(0, 1);

      const instrumentMap = {};
      const initialInstrumentMap = {};
      try {
        const instrumentsResponse = await backend.get(
          `/program/${record.id}/instruments`
        );
        const instruments = instrumentsResponse.data || [];
        instruments.forEach((inst) => {
          const id = inst.instrumentId ?? inst.id;
          if (!id) return;
          const qty = inst.quantity ?? 0;
          if (qty === 0) return;
          instrumentMap[id] = {
            id,
            name: inst.name,
            quantity: qty,
          };
          initialInstrumentMap[id] = qty;
        });
      } catch (err) {
        console.error('Error fetching program instruments:', err);
      }

      const normalizedLanguages = (() => {
        if (Array.isArray(record.languages)) {
          return [
            ...new Set(
              record.languages
                .map((value) => String(value).trim().toLowerCase())
                .filter((value) => ISO6391.validate(value))
            ),
          ];
        }
        const existingValue = record.primaryLanguage;
        if (!existingValue) return [];
        const trimmedValue = String(existingValue).trim();
        if (ISO6391.validate(trimmedValue.toLowerCase())) {
          return [trimmedValue.toLowerCase()];
        }
        const mappedCode = ISO6391.getCode(trimmedValue);
        return mappedCode ? [mappedCode.toLowerCase()] : [];
      })();

      let graduatedTotal = 0;
      let sumEnrollment = 0;
      try {
        const aggRes = await backend.get(
          `/program/${record.id}/enrollment-aggregates`
        );
        graduatedTotal = Number(aggRes.data?.sumGraduated ?? 0);
        sumEnrollment = Number(aggRes.data?.sumEnrollment ?? 0);
      } catch (error) {
        console.error('Error fetching enrollment aggregates:', error);
      }
      if (Number.isNaN(graduatedTotal)) graduatedTotal = 0;
      if (Number.isNaN(sumEnrollment)) sumEnrollment = 0;
      setInitialGraduated(graduatedTotal);

      const netStudentsFromAgg = sumEnrollment - graduatedTotal;
      const resolvedStudents =
        record.students !== null && record.students !== undefined
          ? Number(record.students)
          : netStudentsFromAgg;

      setFormState({
        status: record.status ?? null,
        programName: record.title ?? '',
        partnerOrg: record.partnerOrg ?? record.partner_org ?? null,
        showPartnerOrgOnMap:
          record.showPartnerOrgOnMap ?? record.show_partner_org_on_map ?? false,
        launchDate: record.launchDate ? record.launchDate.split('T')[0] : '',
        regionId: regionId,
        state: record.state ?? null,
        city:
          record.city !== null &&
          record.city !== undefined &&
          record.city !== ''
            ? Number(record.city)
            : null,
        country: record.country ?? null,
        countryIsoCode,
        students: Number.isNaN(resolvedStudents) ? 0 : resolvedStudents,
        graduatedStudents: graduatedTotal,
        instruments: instrumentMap,
        languages: normalizedLanguages,

        programDirectors: programDirectorsForForm,

        curriculumLinks: Array.isArray(record.playlists)
          ? record.playlists
              .filter(
                (p) =>
                  p.link &&
                  ((p.instrumentId !== null && p.instrumentId !== undefined) ||
                    (p.instrument_id !== null && p.instrument_id !== undefined))
              )
              .map((p) => ({
                link: p.link,
                name: p.name || 'Playlist',
                instrumentId: p.instrumentId ?? p.instrument_id,
                instrumentName: p.instrumentName ?? p.instrument_name ?? '',
              }))
          : [],

        media: Array.isArray(record.media)
          ? record.media.map((m) => ({
              id: m.id,
              s3_key: m.s3_key,
              file_name: m.file_name,
              file_type: m.file_type,
              description: m.description ?? null,
            }))
          : [],

        fileChanges: Array.isArray(record.fileChanges)
          ? record.fileChanges.map((f) => ({
              id: f.id,
              s3_key: f.s3_key,
              file_name: f.file_name,
              file_type: f.file_type,
              description: f.description ?? null,
            }))
          : [],
      });

      setInitialProgramDirectorIds(
        mappedProgramDirectors.map((d) => d.userId).filter(Boolean)
      );
      setInitialInstrumentQuantities(initialInstrumentMap);
      setInitialCurriculumLinks(
        (record.playlists ?? [])
          .filter(
            (p) =>
              p.link &&
              ((p.instrumentId !== null && p.instrumentId !== undefined) ||
                (p.instrument_id !== null && p.instrument_id !== undefined))
          )
          .map((p) => ({
            link: p.link,
            instrumentId: p.instrumentId ?? p.instrument_id,
          }))
      );

      setInitialUploadedMedia(
        [...(record.media ?? []), ...(record.fileChanges ?? [])]
          .filter((m) => m.file_name)
          .map((m) => m.file_name)
      );
    }

    (async () => {
      try {
        await loadProgramRegionData();
      } finally {
        if (!cancelled) {
          setIsLoadingProgramData(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    program,
    backend,
    setFormState,
    setInitialProgramDirectorIds,
    setInitialInstrumentQuantities,
    setInitialCurriculumLinks,
    setInitialUploadedMedia,
    setInitialGraduated,
    setIsLoadingProgramData,
  ]);
}
