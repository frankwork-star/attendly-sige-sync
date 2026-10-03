DROP POLICY IF EXISTS courses_select ON public.courses;
CREATE POLICY courses_select ON public.courses FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'encargado')
  OR teacher_profile_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.course_id = courses.id AND public.can_read_student(s.id))
);

DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS user_roles_select_authenticated ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS docs_matricula_read ON storage.objects;
DROP POLICY IF EXISTS docs_matricula_insert ON storage.objects;
DROP POLICY IF EXISTS docs_matricula_update ON storage.objects;
DROP POLICY IF EXISTS docs_matricula_delete ON storage.objects;

CREATE POLICY docs_matricula_read ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documentos-matricula'
  AND (
    public.has_role(auth.uid(), 'encargado')
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id::text = (storage.foldername(name))[1] AND public.can_read_student(s.id)
    )
  )
);
CREATE POLICY docs_matricula_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documentos-matricula' AND public.has_role(auth.uid(), 'encargado'));
CREATE POLICY docs_matricula_update ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documentos-matricula' AND public.has_role(auth.uid(), 'encargado'))
WITH CHECK (bucket_id = 'documentos-matricula' AND public.has_role(auth.uid(), 'encargado'));
CREATE POLICY docs_matricula_delete ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documentos-matricula' AND public.has_role(auth.uid(), 'encargado'));