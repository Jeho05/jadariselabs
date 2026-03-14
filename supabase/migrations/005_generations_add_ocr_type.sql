-- Allow OCR generation type
ALTER TABLE public.generations DROP CONSTRAINT IF EXISTS generations_type_check;
ALTER TABLE public.generations
  ADD CONSTRAINT generations_type_check
  CHECK (type IN ('image', 'chat', 'video', 'audio', 'code', 'ocr'));
