CREATE OR REPLACE FUNCTION public.can_read_student(_student_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT
    public.has_role(auth.uid(), 'encargado')
    OR public.has_role(auth.uid(), 'educadora')
    OR EXISTS (
      SELECT 1 FROM public.guardians g
      JOIN public.profiles p ON lower(p.email) = lower(g.email)
      WHERE g.student_id = _student_id AND p.id = auth.uid()
    )
$function$;

DROP POLICY IF EXISTS courses_select_educadora_all ON public.courses;
CREATE POLICY courses_select_educadora_all ON public.courses FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'educadora'));