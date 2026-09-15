CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text NOT NULL,
  teacher_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  list_number integer,
  enrollment_number text,
  level text NOT NULL DEFAULT 'NT1',
  apellido_paterno text NOT NULL,
  apellido_materno text,
  nombres text NOT NULL,
  run_ipe text,
  birth_date date,
  sex text,
  nee_full_support boolean NOT NULL DEFAULT false,
  address text,
  comuna text,
  speech_test_url text,
  speech_test_name text,
  guardian_interview text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  list_number integer,
  apellido_paterno text,
  apellido_materno text,
  nombres text,
  address text,
  comuna text,
  phone text,
  email text,
  observations text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.student_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  movement_date date NOT NULL DEFAULT current_date,
  movement_type text NOT NULL,
  reason text,
  observations text,
  responsible text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
  blood_type text,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.health_allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  name text NOT NULL,
  severity text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.health_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  name text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  attendance_date date NOT NULL,
  status text NOT NULL DEFAULT 'presente',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, attendance_date)
);

CREATE INDEX idx_attendance_date ON public.attendance (attendance_date);
CREATE INDEX idx_attendance_course ON public.attendance (course_id);
CREATE INDEX idx_students_course ON public.students (course_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses, public.students, public.guardians, public.student_movements, public.health_records, public.health_allergies, public.health_conditions, public.emergency_contacts, public.attendance TO anon, authenticated;
GRANT ALL ON public.courses, public.students, public.guardians, public.student_movements, public.health_records, public.health_allergies, public.health_conditions, public.emergency_contacts, public.attendance TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_courses" ON public.courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_students" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_guardians" ON public.guardians FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_movements" ON public.student_movements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_health_records" ON public.health_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_health_allergies" ON public.health_allergies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_health_conditions" ON public.health_conditions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_emergency_contacts" ON public.emergency_contacts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open_attendance" ON public.attendance FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.courses (id, name, level, teacher_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Medio Mayor A', 'Medio Mayor', 'Profesora Carla Rojas'),
  ('22222222-2222-2222-2222-222222222222', 'NT1 A', 'NT1', 'Profesora Marta Silva'),
  ('33333333-3333-3333-3333-333333333333', 'NT2 A', 'NT2', 'Profesora Ana Muñoz');

INSERT INTO public.students (id, course_id, list_number, enrollment_number, level, apellido_paterno, apellido_materno, nombres, run_ipe, birth_date, sex, nee_full_support, address, comuna, guardian_interview) VALUES
  ('a1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 1, 'M-2026-001', 'Medio Mayor', 'Aguilar', 'Pérez', 'Sofía Antonia', '25.123.456-7', '2022-04-12', 'Femenino', false, 'Los Aromos 145', 'Temuco', 'Familia participativa. Se acuerda apoyo en lenguaje.'),
  ('a1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 2, 'M-2026-002', 'Medio Mayor', 'Bravo', 'Soto', 'Matías Ignacio', '25.234.567-8', '2022-07-03', 'Masculino', true, 'Pasaje El Roble 22', 'Padre Las Casas', 'Requiere apoyo completo, informe fonoaudiológico entregado.'),
  ('a1000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 1, 'M-2026-010', 'NT1', 'Cárdenas', 'Lagos', 'Emilia Paz', '24.876.543-2', '2021-02-18', 'Femenino', false, 'Av. Alemania 1220', 'Temuco', 'Sin observaciones relevantes.'),
  ('a1000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 2, 'M-2026-011', 'NT1', 'Díaz', 'Muñoz', 'Benjamín Andrés', '24.765.432-1', '2021-05-30', 'Masculino', false, 'Caupolicán 780', 'Temuco', 'Apoderada solicita reuniones mensuales.'),
  ('a1000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 3, 'M-2026-012', 'NT1', 'Espinoza', 'Vidal', 'Isidora Belén', '24.654.321-9', '2021-09-14', 'Femenino', true, 'Los Cerezos 45', 'Freire', 'Ingresa con apoyo PIE.'),
  ('a1000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 1, 'M-2026-020', 'NT2', 'Fuentes', 'Riquelme', 'Tomás Alonso', '23.543.210-8', '2020-03-08', 'Masculino', false, 'Bulnes 350', 'Temuco', 'Buena adaptación.'),
  ('a1000000-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333', 2, 'M-2026-021', 'NT2', 'González', 'Herrera', 'Amanda Josefa', '23.432.109-7', '2020-06-25', 'Femenino', false, 'Los Notros 89', 'Padre Las Casas', 'Se registra entrevista inicial completa.'),
  ('a1000000-0000-0000-0000-000000000008', '33333333-3333-3333-3333-333333333333', 3, 'M-2026-022', 'NT2', 'Huenchur', 'Painen', 'Lautaro Nahuel', '23.321.098-6', '2020-11-02', 'Masculino', false, 'Camino Labranza km 4', 'Temuco', 'Familia mapuche, solicita apoyo intercultural.');

INSERT INTO public.guardians (student_id, list_number, apellido_paterno, apellido_materno, nombres, address, comuna, phone, email, observations)
SELECT s.id, s.list_number, s.apellido_paterno, s.apellido_materno, 'Apoderado/a de ' || s.nombres, s.address, s.comuna, '+569' || lpad((floor(random()*90000000)+10000000)::text, 8, '0'), lower(replace(s.apellido_paterno, ' ', '')) || '.apoderado@correo.cl', 'Contacto preferente por teléfono.'
FROM public.students s;

INSERT INTO public.health_records (student_id, blood_type, notes)
SELECT id, (ARRAY['O+','A+','B+','O-','A-'])[1 + (row_number() OVER (ORDER BY created_at))::int % 5], 'Ficha de salud actualizada al inicio del año escolar.'
FROM public.students;

INSERT INTO public.health_allergies (student_id, name, severity) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'Maní', 'Alta'),
  ('a1000000-0000-0000-0000-000000000002', 'Polen', 'Media'),
  ('a1000000-0000-0000-0000-000000000005', 'Penicilina', 'Alta'),
  ('a1000000-0000-0000-0000-000000000007', 'Lactosa', 'Baja');

INSERT INTO public.health_conditions (student_id, name, notes) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'Asma', 'Usa inhalador, disponible en enfermería.'),
  ('a1000000-0000-0000-0000-000000000005', 'Trastorno del lenguaje', 'Atención fonoaudiológica semanal.');

INSERT INTO public.emergency_contacts (student_id, name, relationship, phone)
SELECT id, 'Contacto de ' || nombres, 'Madre', '+56912345678' FROM public.students;

INSERT INTO public.student_movements (student_id, movement_date, movement_type, reason, observations, responsible) VALUES
  ('a1000000-0000-0000-0000-000000000004', '2026-04-15', 'Cambio de jornada', 'Trabajo de la apoderada', 'Pasa de jornada mañana a tarde.', 'Jefa de UTP'),
  ('a1000000-0000-0000-0000-000000000006', '2026-06-02', 'Cambio Escuela Paihuen - Paihuen Mapu', 'Cercanía al domicilio', 'Traslado interno autorizado.', 'Jefa de UTP');

INSERT INTO public.attendance (student_id, course_id, attendance_date, status)
SELECT s.id, s.course_id, d::date,
  CASE WHEN random() < 0.86 THEN 'presente' WHEN random() < 0.6 THEN 'justificado' ELSE 'ausente' END
FROM public.students s
CROSS JOIN generate_series('2026-08-03'::date, '2026-09-11'::date, interval '1 day') d
WHERE extract(isodow FROM d) < 6;