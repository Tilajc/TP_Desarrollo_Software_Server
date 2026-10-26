# StudyBuddies - Backend Server REST API

Servidor API RESTful para la plataforma colaborativa de estudio universitario **StudyBuddies**. Provee la lógica de negocio, persistencia relacional con PostgreSQL y Prisma ORM, autenticación basada en JWT, autorización por roles (`ADMIN` y `USER`) y validación de esquemas con Zod.

Desarrollado para la cátedra de **Desarrollo de Software** - UTN.

## Descripción del Proyecto

El backend expone los endpoints y servicios necesarios para satisfacer los requerimientos funcionales y el modelo de dominio de StudyBuddies:

- **Autenticación y Seguridad:** Registro de cuentas, login mediante hash seguro (`bcryptjs`) y generación de tokens de sesión con `jsonwebtoken` (JWT).
- **Control de Acceso (RBAC):** Middlewares de protección de rutas para perfiles `ADMIN` y `USER`.
- **Validación de Datos:** Validación estricta en el servidor para payloads y parámetros utilizando `zod`.
- **Modelo Relacional de Dominio:**
  - **Materias (`Subject`) y Temas (`Topic`):** Organización curricular base.
  - **Tarjetas (`Card`) y Pistas (`Hint`):** Tarjetas de autoevaluación con pistas dependientes.
  - **Resúmenes (`Summary`):** Apuntes y resúmenes temáticos por materia y tema.
  - **Cursos (`Course`) y Suscripciones (`CourseSubscription`):** Agrupación de contenidos por estudiante y gestión de inscripciones de alumnos para acceder a material preparado.
  - **Usuarios (`User`):** Directorio y perfiles de estudiantes y administradores.

## Tecnologías y Librerías

El backend está construido con la última generación del stack de Node.js:

- **Entorno & Módulos:** [Node.js](https://nodejs.org/) (ES Modules - `type: "module"`)
- **Framework Web:** [Express.js v5](https://expressjs.com/)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) (`pg` + `@prisma/adapter-pg`)
- **ORM & Migraciones:** [Prisma v7](https://www.prisma.io/) (`@prisma/client` & `prisma CLI`)
- **Validación de Esquemas:** [Zod](https://zod.dev/)
- **Criptografía & Auth:**
  - [bcryptjs](https://github.com/dcodeIO/bcrypt.js) para hashing y salting de contraseñas.
  - [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) para emisión y verificación de tokens JWT.
- **Configuración & CORS:** [dotenv](https://github.com/motdotla/dotenv) y [cors](https://github.com/expressjs/cors)
- **Desarrollo & Tooling:** [Nodemon](https://nodemon.io/), ESLint 10 y Prettier

## Instrucciones de Instalación y Utilización

### Prerrequisitos

- [Node.js](https://nodejs.org/) v18.x o superior.
- Base de datos [PostgreSQL](https://www.postgresql.org/) activa (local o remota como Supabase, Neon o Render).
- Gestor de paquetes `npm`.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Tilajc/TP_Desarrollo_Software_Server.git
cd TP_Desarrollo_Software_Server
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del servidor:

```env
PORT=3000
NODE_ENV=development

# Conexión a PostgreSQL (local o externa en la nube)
DATABASE_URL="..."

# Clave secreta para firma de tokens JWT
JWT_SECRET=...

# Origen permitido para CORS (URL del frontend)
CLIENT_URL=...
```

### 4. Generar Cliente Prisma y Cargar Base de Datos

Genera el cliente tipado de Prisma y corre las migraciones:

```bash
# Genera el cliente de Prisma
npm run build

# Si tienes migraciones de Prisma listas para aplicar
npx prisma migrate dev --name init

# Ejecutar el seeder con datos iniciales (materias, usuarios, cursos)
npm run seed
```

### 5. Iniciar el Servidor

```bash
# Iniciar en desarrollo con recarga automática (Nodemon)
npm start
```

## Enlaces de Deploy

- **API REST (Producción):**
- **Frontend App:**

## Credenciales para Pruebas del Deploy

Usuarios cargados por defecto a través del seeder (`npm run seed`):

| Rol       | Correo Electrónico       | Contraseña | Capacidades y Alcance                                                                          |
| :-------- | :----------------------- | :--------- | :--------------------------------------------------------------------------------------------- |
| **ADMIN** | `admin@gmail.com`        | `pass12`   | Gestión de usuarios (`/api/users`), administración de cursos (`/api/courses`) e inscripciones. |
| **USER**  | `carlos.gomez@gmail.com` | `carlos12` | Crear y responder tarjetas, consultar temas, crear resúmenes y suscribirse a cursos.           |

## Autores

Trabajo Práctico para la cátedra de **Desarrollo de Software** - UTN:

- **Micaela Ponce** - Legajo: `44094`
- **Juan Cruz Tilatti** - Legajo: `42448`
