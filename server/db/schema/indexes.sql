-- Used in JOIN: program p → country c ON c.id = p.country
CREATE INDEX IF NOT EXISTS idx_program_country ON program(country);

-- Used in JOIN: country c → region r ON r.id = c.region_id
CREATE INDEX IF NOT EXISTS idx_country_region_id ON country(region_id);

-- Used in JOIN + aggregation subqueries: program_update pu ON pu.program_id = p.id
CREATE INDEX IF NOT EXISTS idx_program_update_program_id ON program_update(program_id);

-- Used in aggregation JOIN: enrollment_change ec ON ec.update_id = pu.id
CREATE INDEX IF NOT EXISTS idx_enrollment_change_update_id ON enrollment_change(update_id);

-- Used in aggregation JOIN: instrument_change ic ON ic.update_id = pu.id
CREATE INDEX IF NOT EXISTS idx_instrument_change_update_id ON instrument_change(update_id);
