-- Add waitlist modal toggle to site_settings
INSERT INTO public.site_settings (key, message, is_enabled) 
VALUES ('show_site_waitlist_modal', 'false', true)
ON CONFLICT (key) DO NOTHING;
