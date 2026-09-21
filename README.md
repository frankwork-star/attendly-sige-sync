# Asistencia Fácil
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Nuestra propuesta para el módulo de Asistencia reemplaza el libro de asistencia en papel por un registro digital organizado por curso, facilitando el conteo y la revisión previa a su carga mensual en el SIGE (Sistema de Información General de Estudiantes del Mineduc). El sistema conserva el historial de asistencia de períodos anteriores.

Sobre el registro digital por curso

Cada curso tiene su propio registro de asistencia diaria, reemplazando la hoja física del libro de clases.

El conteo (presentes/ausentes) se calcula automáticamente a partir de los registros cargados, eliminando el conteo manual que hoy se hace a mano.

Sobre la revisión previa a la carga en SIGE

Antes de subir los datos a SIGE, el sistema permite revisar mes a mes lo registrado por curso, para detectar y corregir omisiones antes del envío oficial.

Esto reduce el riesgo de errores en la carga mensual, ya que la revisión se hace sobre el mismo dato que luego se exporta.

Sobre el historial de períodos anteriores

El sistema no solo registra el mes en curso, sino que conserva los períodos anteriores, permitiendo consultar la asistencia de meses o años pasados sin depender de libros físicos archivados.

Esto facilita comparar la asistencia de un curso entre distintos períodos.

Sobre el módulo web y la generación del Excel

El módulo web consulta directamente la base de datos donde están almacenados los registros de asistencia.

A partir de esa consulta, genera un archivo Excel con el formato necesario para la carga mensual en SIGE, evitando que alguien deba traspasar los datos manualmente a la planilla.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/06dfd9c5-1ed9-4659-8c2a-8c24283dfc6a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
