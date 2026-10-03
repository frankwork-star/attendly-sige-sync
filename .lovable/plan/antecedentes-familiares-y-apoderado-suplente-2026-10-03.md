# Antecedentes familiares y apoderado suplente

## Objetivo
Ampliar la ficha personal del estudiante con antecedentes familiares y la gestión opcional de un apoderado suplente, respetando los permisos y el diseño actuales.

## Cambios
- Añadir a la ficha la sección **Antecedentes Familiares** con estado civil de los padres, composición del hogar, número de hijos y posición del estudiante entre sus hermanos.
- Añadir **Parentesco o relación** al apoderado principal.
- Incorporar un botón **Agregar Apoderado Suplente** que despliegue nombre completo, RUT, parentesco, teléfono, correo y dirección; permitir quitarlo antes de guardar.
- Mantener todos estos campos bloqueados para Educadora y editables para Encargado / Administración.

## Persistencia y validación
- Guardar los antecedentes familiares junto al estudiante.
- Guardar el apoderado suplente en un registro individual vinculado al estudiante, con acceso protegido por las mismas reglas de la ficha.
- Validar que el número de hijos no sea negativo, que el correo tenga formato válido y que nombre, RUT, parentesco y teléfono estén completos cuando se agregue un suplente.

## Verificación
- Comprobar creación, edición, eliminación visual y recarga de los nuevos datos.
- Confirmar la vista editable para Encargado y de solo lectura para Educadora.
- Revisar compilación y presentación en pantalla.

## Detalles técnicos
- El cambio será aditivo y no alterará los datos existentes.
- La nueva tabla tendrá permisos explícitos, seguridad por fila y acceso vinculado a las reglas actuales del estudiante.
