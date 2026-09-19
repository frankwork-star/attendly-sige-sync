# Usuarios, ingreso y permisos

Objetivo: nadie se registra solo. El Administrador crea cada cuenta, confirma la creación con un código que llega a su correo, y el sistema aplica los permisos de cada rol tanto en pantalla como en la base de datos.

## 1. Ingreso al sistema

- La pantalla de acceso queda solo con **Ingresar** (correo y contraseña). Se elimina la pestaña "Crear cuenta".
- Se desactiva el registro libre en el backend, así nadie puede crear cuentas por fuera del panel.
- La sesión sigue manejada con el token seguro del backend, con renovación automática.
- Se agrega **¿Olvidaste tu contraseña?** con enlace de recuperación por correo y una pantalla para definir la nueva clave.
- La cuenta de Encargado que ya existe queda como Administrador y desde ella se crea al resto del equipo.

## 2. Alta de usuarios por el Administrador (con código de confirmación)

Nuevo apartado "Usuarios" en el panel de Administración:

1. El Administrador completa: Nombre, RUT, Correo, Rol y Curso asignado (solo si el rol es Profesor/Educadora).
2. Al enviar, queda una solicitud pendiente y se envía un **código de un solo uso al correo del Administrador** (vence en 15 minutos).
3. El Administrador escribe ese código en el panel para confirmar.
4. Recién entonces se crea la cuenta, con contraseña temporal, y se envía al **nuevo usuario** un correo con su acceso y la indicación de cambiar la clave al primer ingreso.
5. Lista de solicitudes pendientes con opciones de reenviar código o cancelar.

Requisito: el envío de correos del proyecto debe quedar activo con un dominio verificado. Si aún no lo está, te pediré el dominio; mientras tanto el código también se muestra en el panel para no bloquear las pruebas.

## 3. Roles y permisos

**Administrador** (Directivos, Jefas de UTP, Encargados): acceso total a todos los módulos, crear/ver/editar/eliminar, gestión de usuarios, cursos y respaldos.

**Profesor / Educadora**: ve únicamente los estudiantes de su curso asignado.
- Estudiantes, Ficha de Salud y datos de Apoderados: **solo lectura** (sin botones de guardar, editar ni eliminar).
- Asistencia: registro, consulta y modificación completa de su curso.

**Apoderado**: solo lectura de la ficha de su(s) hijo(s).

Los permisos se aplican en dos capas: los botones y formularios se ocultan o bloquean según el rol, y las reglas de la base de datos rechazan cualquier cambio no permitido aunque se intente por otra vía.

## 4. Fuera de alcance por ahora

- Módulo de Notas: queda para una etapa siguiente (lo dejamos anotado en el listado de tareas).
- Configuración de respaldos: se deja el apartado visible para Administradores, con la descarga de datos en un paso posterior.

## Detalles técnicos

- Migración: `profiles.rut`; nueva tabla `pending_users` (nombre, rut, email, rol, course_id, hash del código, expiración, creado_por, estado) con RLS solo para administradores y grants correspondientes.
- Server functions (`createServerFn` + `requireSupabaseAuth`), verificando `has_role(auth.uid(),'encargado')` dentro del handler antes de cualquier operación privilegiada:
  - `requestUserInvite`: valida datos, guarda la solicitud con el código hasheado (SHA-256 + sal) y envía el correo al administrador.
  - `confirmUserInvite`: compara el código, y con el cliente administrativo crea el usuario en Auth (confirmado), el perfil, la fila en `user_roles` y la asignación de curso; luego envía el correo de credenciales.
- Correos con `email_domain--scaffold_transactional_email_templates`: plantilla `admin-user-code` y plantilla `new-user-credentials`, enviadas con `sendTemplateEmail` desde el servidor con `idempotencyKey`.
- Auth: `configure_auth` con `disable_signup: true`; `enable_email_auth` ya aplicado.
- RLS: se reemplazan las políticas abiertas actuales (`open_*`) de `students`, `guardians`, `health_*`, `emergency_contacts`, `student_movements`, `courses` y `attendance` por políticas por rol: administrador CRUD total; educadora SELECT limitado a `course_id` de sus cursos y CRUD completo solo en `attendance`; apoderado SELECT de sus estudiantes vinculados. Se revoca el acceso `anon`.
- Frontend: `src/lib/role.tsx` expone `rut` y permisos derivados; `src/lib/scope.ts` se usa como única fuente del filtro por curso y se aplica también en `sige.tsx`, `estudiantes.index.tsx`, `estudiantes.$id.tsx` e `index.tsx`. Todas las páginas de datos pasan bajo `_authenticated`. Nueva ruta pública `/reset-password`.
