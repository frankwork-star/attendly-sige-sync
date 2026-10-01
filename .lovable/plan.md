# Refactorización del módulo Estudiantes

## Objetivo
Reorganizar la navegación para agrupar los registros personales bajo **Estudiantes**, con cuatro submódulos coherentes y acciones visibles según el rol activo.

## Cambios
- Mantener **Matrícula** exactamente como módulo independiente y añadir, además, un menú desplegable **Estudiantes** en la cabecera; solo Salud Escolar dejará de ser un acceso principal separado.
- Crear rutas independientes para:
  - **Datos**: listado con identidad, RUN/IPE, nivel y curso.
  - **Procesos de Matrícula**: listado orientado a matrícula, entrevista y documento fonoaudiológico.
  - **Movimientos**: listado con último movimiento e ingreso al historial individual.
  - **Salud Escolar**: trasladar la vista actual sin cambiar su lógica de datos.
- Mantener la ruta y experiencia actual de **Matrícula** sin modificaciones. Las nuevas páginas de Estudiantes usarán rutas separadas, y `/salud` redirigirá a la nueva ubicación para conservar enlaces existentes.
- Crear una estructura visual compartida para encabezado, buscador, filtros por nivel/curso, tabla, estados de carga/vacío y acceso a la ficha.

## Permisos
- **Educadora**: consultas limitadas a su curso y todas las vistas en solo lectura; no se mostrarán acciones de crear, editar, eliminar, cargar archivos ni guardar.
- **Encargado / Administración**: se mantendrán habilitadas las acciones de creación y modificación disponibles.
- La interfaz usará exclusivamente los permisos derivados del contexto de sesión actual; las reglas existentes de la base de datos seguirán siendo la segunda capa de protección.

## Verificación
- Comprobar el menú desplegable en escritorio y móvil.
- Probar cada submódulo y sus filtros con perfil Administrador y Educadora.
- Confirmar que una Educadora no ve acciones de escritura y que el Administrador sí.
- Revisar navegación a fichas, redirección de Salud, consola y compilación.

## Detalles técnicos
- Las nuevas páginas usarán rutas TanStack independientes y metadatos propios.
- Se reutilizarán los componentes de tabla, filtros, botones y paneles ya existentes.
- No se cambiará el esquema ni el contenido de la base de datos.
