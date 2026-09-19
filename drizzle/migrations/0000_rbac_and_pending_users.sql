-- 1. RUT en perfiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rut text;

-- 2. Solicitudes de creación de usuarios (alta por administrador con código)
CREATE TABLE IF NOT EXISTS public.pending_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  rut text,
  email text NOT NULL,
  role public.app_role NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  attempts integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);

GRANT SELECT ON public.pending_users TO authenticated;
GRANT ALL ON public.pending_users TO service_role;
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pending_users_admin_read ON public.pending_users;
CREATE POLICY pending_users_admin_read ON public.pending_users
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'encargado'));

-- 3. Helpers de alcance
CREATE OR REPLACE FUNCTION public.teaches_course(_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _course_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = _course_id AND c.teacher_profile_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.can_read_student(_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(auth.uid(), 'encargado')
    OR EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = _student_id AND c.teacher_profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.guardians g
      JOIN public.profiles p ON lower(p.email) = lower(g.email)
      WHERE g.student_id = _student_id AND p.id = auth.uid()
    )
$$;

CREATE OR REPLACE FUNCTION public.can_write_attendance(_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(auth.uid(), 'encargado')
    OR EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = _student_id AND c.teacher_profile_id = auth.uid()
    )
$$;

REVOKE ALL ON FUNCTION public.teaches_course(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_read_student(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_write_attendance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.teaches_course(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_student(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_attendance(uuid) TO authenticated;

-- 4. Cierre del acceso anónimo y políticas por rol
DROP POLICY IF EXISTS open_courses ON public.courses;
DROP POLICY IF EXISTS open_students ON public.students;
DROP POLICY IF EXISTS open_guardians ON public.guardians;
DROP POLICY IF EXISTS open_health_records ON public.health_records;
DROP POLICY IF EXISTS open_health_allergies ON public.health_allergies;
DROP POLICY IF EXISTS open_health_conditions ON public.health_conditions;
DROP POLICY IF EXISTS open_emergency_contacts ON public.emergency_contacts;
DROP POLICY IF EXISTS open_movements ON public.student_movements;
DROP POLICY IF EXISTS open_attendance ON public.attendance;

REVOKE ALL ON public.courses FROM anon;
REVOKE ALL ON public.students FROM anon;
REVOKE ALL ON public.guardians FROM anon;
REVOKE ALL ON public.health_records FROM anon;
REVOKE ALL ON public.health_allergies FROM anon;
REVOKE ALL ON public.health_conditions FROM anon;
REVOKE ALL ON public.emergency_contacts FROM anon;
REVOKE ALL ON public.student_movements FROM anon;
REVOKE ALL ON public.attendance FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardians TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_allergies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_conditions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.courses TO service_role;
GRANT ALL ON public.students TO service_role;
GRANT ALL ON public.guardians TO service_role;
GRANT ALL ON public.health_records TO service_role;
GRANT ALL ON public.health_allergies TO service_role;
GRANT ALL ON public.health_conditions TO service_role;
GRANT ALL ON public.emergency_contacts TO service_role;
GRANT ALL ON public.student_movements TO service_role;
GRANT ALL ON public.attendance TO service_role;

-- courses: todos los autenticados pueden leer; solo admin escribe
CREATE POLICY courses_select ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY courses_admin_write ON public.courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'encargado'))
  WITH CHECK (public.has_role(auth.uid(), 'encargado'));

-- students
CREATE POLICY students_select ON public.students FOR SELECT TO authenticated
  USING (public.can_read_student(id));
CREATE POLICY students_admin_write ON public.students FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'encargado'))
  WITH CHECK (public.has_role(auth.uid(), 'encargado'));

-- datos vinculados al estudiante: lectura por alcance, escritura solo admin
CREATE POLICY guardians_select ON public.guardians FOR SELECT TO authenticated
  USING (public.can_read_student(student_id));
CREATE POLICY guardians_admin_write ON public.guardians FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'encargado'))
  WITH CHECK (public.has_role(auth.uid(), 'encargado'));

CREATE POLICY health_records_select ON public.health_records FOR SELECT TO authenticated
  USING (public.can_read_student(student_id));
CREATE POLICY health_records_admin_write ON public.health_records FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'encargado'))
  WITH CHECK (public.has_role(auth.uid(), 'encargado'));

CREATE POLICY health_allergies_select ON public.health_allergies FOR SELECT TO authenticated
  USING (public.can_read_student(student_id));
CREATE POLICY health_allergies_admin_write ON public.health_allergies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'encargado'))
  WITH CHECK (public.has_role(auth.uid(), 'encargado'));

CREATE POLICY health_conditions_select ON public.health_conditions FOR SELECT TO authenticated
  USING (public.can_read_student(student_id));
CREATE POLICY health_conditions_admin_write ON public.health_conditions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'encargado'))
  WITH CHECK (public.has_role(auth.uid(), 'encargado'));

CREATE POLICY emergency_contacts_select ON public.emergency_contacts FOR SELECT TO authenticated
  USING (public.can_read_student(student_id));
CREATE POLICY emergency_contacts_admin_write ON public.emergency_contacts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'encargado'))
  WITH CHECK (public.has_role(auth.uid(), 'encargado'));

CREATE POLICY movements_select ON public.student_movements FOR SELECT TO authenticated
  USING (public.can_read_student(student_id));
CREATE POLICY movements_admin_write ON public.student_movements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'encargado'))
  WITH CHECK (public.has_role(auth.uid(), 'encargado'));

-- attendance: educadora con control total sobre su curso
CREATE POLICY attendance_select ON public.attendance FOR SELECT TO authenticated
  USING (public.can_read_student(student_id));
CREATE POLICY attendance_insert ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (public.can_write_attendance(student_id));
CREATE POLICY attendance_update ON public.attendance FOR UPDATE TO authenticated
  USING (public.can_write_attendance(student_id))
  WITH CHECK (public.can_write_attendance(student_id));
CREATE POLICY attendance_delete ON public.attendance FOR DELETE TO authenticated
  USING (public.can_write_attendance(student_id));