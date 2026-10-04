ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS parents_marital_status text,
  ADD COLUMN IF NOT EXISTS lives_with text,
  ADD COLUMN IF NOT EXISTS children_count integer,
  ADD COLUMN IF NOT EXISTS sibling_position text;
ALTER TABLE public.students ADD CONSTRAINT students_children_count_nonneg CHECK (children_count IS NULL OR children_count >= 0);
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS relationship text;

CREATE TABLE public.substitute_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  rut text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.substitute_guardians TO authenticated;
GRANT ALL ON public.substitute_guardians TO service_role;
ALTER TABLE public.substitute_guardians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sub_guardians_select" ON public.substitute_guardians FOR SELECT TO authenticated USING (public.can_read_student(student_id));
CREATE POLICY "sub_guardians_insert" ON public.substitute_guardians FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'encargado'));
CREATE POLICY "sub_guardians_update" ON public.substitute_guardians FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'encargado')) WITH CHECK (public.has_role(auth.uid(), 'encargado'));
CREATE POLICY "sub_guardians_delete" ON public.substitute_guardians FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'encargado'));