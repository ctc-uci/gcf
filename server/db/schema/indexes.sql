CREATE INDEX idx_program_country ON public.program USING btree (country);

CREATE INDEX idx_country_region_id ON public.country USING btree (region_id);

CREATE INDEX idx_program_update_program_id ON public.program_update USING btree (program_id);

CREATE INDEX idx_enrollment_change_update_id ON public.enrollment_change USING btree (update_id);

CREATE INDEX idx_instrument_change_update_id ON public.instrument_change USING btree (update_id);
