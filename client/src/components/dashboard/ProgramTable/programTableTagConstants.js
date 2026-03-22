export const STATUS_TAG_STYLES = {
  active: {
    label: 'Launched',
    bg: '#e0f2f1',
    color: '#00796b',
  },
  inactive: {
    label: 'Developing',
    bg: '#fff3e0',
    color: '#ef6c00',
  },
};

const INSTRUMENT_TAG_PALETTE = [
  { bg: '#C6F6D5', color: '#22543D' },
  { bg: '#BEE3F8', color: '#2C5282' },
  { bg: '#FED7D7', color: '#742A2A' },
  { bg: '#FEECC7', color: '#744210' },
  { bg: '#E9D8FD', color: '#553C9A' },
  { bg: '#FED7E2', color: '#702459' },
  { bg: '#C4F1F9', color: '#086F83' },
  { bg: '#D6F3D5', color: '#276749' },
];

export function getInstrumentTagStyle(instrumentName) {
  if (!instrumentName) return INSTRUMENT_TAG_PALETTE[0];
  let hash = 0;
  const str = String(instrumentName).toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % INSTRUMENT_TAG_PALETTE.length;
  return INSTRUMENT_TAG_PALETTE[index];
}
