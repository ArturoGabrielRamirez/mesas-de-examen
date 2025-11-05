# Sistema de Gestión de Mesas de Examen

Aplicación web moderna para la gestión integral de mesas de exámenes del Colegio Dr. Juan E. Martínez – Bella Vista (Ctes).

## Características

- **Autenticación con Firebase** - Registro y login con validación de roles
- **Sistema de Roles** - Estudiantes, Profesores, Preceptores y Administradores
- **Gestión de Mesas** - Crear, editar y administrar mesas de examen
- **Reservas de Examen** - Los estudiantes pueden reservar sus turnos
- **Registro de Notas y Asistencia** - Carga de calificaciones y asistencia
- **Generación de PDFs** - Comprobantes, actas y reportes institucionales
- **Panel Administrativo** - Validación de usuarios y gestión general

## Stack Tecnológico

- **Next.js 14+** - Framework React con App Router
- **Firebase** - Autenticación y Firestore (base de datos)
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes preconstruidos
- **react-hook-form + Yup** - Validación de formularios
- **jsPDF** - Generación de PDFs
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos
- **Sonner** - Notificaciones

## Instalación

### 1. Clonar el repositorio

\`\`\`bash
git clone <tu-repositorio>
cd sistema-mesas-examen
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

NEXT_PUBLIC_APP_NAME="Sistema de Mesas de Examen"
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Iniciar el servidor de desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

\`\`\`
src/
├── app/                    # Rutas y páginas de Next.js
│   ├── (auth)/            # Autenticación (login, registro)
│   ├── student/           # Dashboard de estudiantes
│   ├── teacher/           # Dashboard de profesores
│   ├── admin/             # Panel administrativo
│   ├── layout.tsx         # Layout raíz
│   └── page.tsx           # Página de inicio
├── components/            # Componentes reutilizables
├── hooks/                 # Hooks personalizados
├── lib/                   # Funciones auxiliares y servicios
├── types/                 # Tipos TypeScript
└── styles/                # Estilos globales
\`\`\`

## Roles y Permisos

### Estudiantes
- Registrarse y esperar validación
- Reservar mesas de examen
- Ver notas y asistencia
- Descargar comprobantes en PDF

### Profesores
- Crear y gestionar mesas de examen
- Registrar notas y asistencia
- Descargar actas en PDF

### Preceptores/Administrativos
- Validar registros de estudiantes
- Crear cuentas de profesores
- Gestionar usuarios y mesas
- Generar reportes generales en PDF

## Flujo de Registro

1. El estudiante se registra con sus datos personales
2. Su cuenta queda pendiente de validación
3. Un preceptor aprueba o rechaza el registro
4. Una vez validado, puede acceder a todas las funcionalidades

## Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita Authentication (Email/Password)
3. Crea una base de datos Firestore
4. Copia las credenciales al archivo `.env.local`

## Desarrollo Local

Para ejecutar con variables de entorno locales:

\`\`\`bash
npm run dev
\`\`\`

Las variables se cargan automáticamente desde `.env.local`.

## Estructura de Base de Datos (Firestore)

### Colecciones

- **users** - Documentos con datos de usuarios
- **exam_tables** - Mesas de examen
- **reservations** - Reservas de estudiantes
- **grades** - Calificaciones registradas
- **attendance** - Registro de asistencia
- **subjects** - Materias disponibles

## Seguridad

- ✅ Autenticación con Firebase Auth
- ✅ Validación de roles en routes
- ✅ Variables sensibles en .env.local
- ✅ Validación de formularios con Yup
- ✅ Tipado completo en TypeScript

## Paleta Institucional

- Marrón claro (primario): #B48A60
- Bordó oscuro (secundario): #5A1E1E
- Beige claro (acento): #F3E9DC
- Gris oscuro (texto): #222222
- Blanco (fondo): #FFFFFF

## Próximos Pasos

- [ ] Integración con Google Calendar API
- [ ] Sistema de notificaciones por email
- [ ] Modo oscuro/claro con persistencia
- [ ] Búsqueda y filtrado avanzado
- [ ] Registro de actividad (logs)
- [ ] Exportación de reportes en Excel

## Licencia

Proyecto educativo para Colegio Dr. Juan E. Martínez.

## Soporte

Para reportar bugs o sugerencias, abre un issue en el repositorio.
