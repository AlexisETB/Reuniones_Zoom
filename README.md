# BackEnd Login y agendamiento de citas por Zoom


> API RESTful para gestión de agendamientos de citas con reuniones Zoom autogeneradas con autenticación JWT y base de datos PostgreSQL usando Prisma.

---

## Requisitos

* **Node.js** ≥ 18
* **npm** ≥ 9 
* **PostgreSQL** corriendo y accesible

---

## Instalación y configuración

1. **Inicializar el proyecto** (si aún no lo has hecho):

   ```bash
   npm init -y
   ```

2. **Instalar dependencias**:

   ```bash
   npm install express pg bcrypt jsonwebtoken dotenv cors express-validator @prisma/client
   ```

3. **Instalar dependencias de desarrollo**:

   ```bash
   npm install --save-dev nodemon
   ```

4. **Configurar variables de entorno**:

   * Edita `.env` con tus credenciales y configuraciones:

     ```dotenv
     DATABASE_URL=postgresql://usuario:password@localhost:5432/mi_bd
     JWT_SECRET=clave_secreta_aqui
     PORT=3000
     ```

5. **Generar cliente de Prisma**:

   ```bash
   npx prisma generate
   ```
   para generar el cliente prisma, aegurate de primero ejectuar node app.js

6. **(Opcional) Ejecutar migraciones**:

   ```bash
   npx prisma migrate dev --name init
   ```

---

##  Ejecución del servidor

node app.js


El servidor se levantará en el puerto configurado (`3000` por defecto) y estará listo para recibir solicitudes.

---

##Scripts disponibles

En el campo `scripts` de tu `package.json` encontrarás:

```json
"scripts": {
  "dev": "nodemon app.js",
  "start": "node app.js"
}
```

* `npm run dev` – Inicia el servidor en modo desarrollo.
* `npm start` – Inicia el servidor en modo producción.

---

## 🔍 Uso básico de la API

### 1. Autenticación

#### Register (cliente)
- **Method:** POST  
- **URL:** `{{base_url}}/auth/register`  
- **Body (JSON):**
  ```json
  {
    "nombres": "María",
    "apellidos": "González",
    "cedula": "10293847",
    "fecha_nacimiento": "1985-06-15",
    "telefono": "3001234567",
    "pais": "Colombia",
    "ciudad": "Medellín",
    "email": "maria@example.com",
    "discapacidad": false
  }
  ```Respuesta:
    {
    "token": "eyJhbGciOi..."
    }

    Login (cliente/profesional)
Method: POST

URL: {{base_url}}/auth/login

Body (JSON):

json
Copiar código
{
  "email": "maria@example.com",
  "password": "102938471985"
}

Login (admin)
Method: POST

URL: {{base_url}}/auth/admin/login

Body (JSON):

json
{
  "usuario": "admin_principal",
  "password": "su_contraseña"
}

Cambio de contraseña (admin)
Method: PUT

URL: {{base_url}}/auth/admin/password

Headers:

css
Authorization: Bearer {{token_admin}}
Body (JSON):

json
{
  "oldPassword": "su_contraseña",
  "newPassword": "nuevaClave123"
}

### 2. Servicios y Profesionales
Listar servicios
Method: GET

URL: {{base_url}}/servicios

Crear servicio (admin)
Method: POST

URL: {{base_url}}/servicios

Headers:

css

Authorization: Bearer {{token_admin}}

Body (JSON):

json
{
  "nombre": "Psicología",
  "descripcion": "Atención psicológica"
}
Listar profesionales
Method: GET

URL: {{base_url}}/profesionales

Crear profesional (admin)
Method: POST

URL: {{base_url}}/profesionales

Headers:

css

Authorization: Bearer {{token_admin}}
Body (JSON):

json

{
  "cedula": "76543210",
  "nombres": "Carlos",
  "apellidos": "Ramírez",
  "email": "carlos@example.com",
  "telefono": "3101234567",
  "descripcion": "Terapeuta familiar",
  "servicioId": 1
}

### 4. Citas
Solicitar cita
Method: POST

URL: {{base_url}}/citas

Headers:

css

Authorization: Bearer {{token_user}}
Body (JSON):

json

{
  "servicioId": 1,
  "profesionalId": 1,
  "fecha": "2025-05-20",
  "hora": "10:30",
  "razon": "Consulta inicial"
}
Ver mis citas (usuario)
Method: GET

URL: {{base_url}}/citas/mis-citas

Headers:

css

Authorization: Bearer {{token_user}}
Ver citas por profesional (usuario)
Method: GET

URL: {{base_url}}/citas/usuario/profesional/1

Headers:

css

Authorization: Bearer {{token_user}}
Ver citas por fecha (usuario)
Method: GET

URL: {{base_url}}/citas/usuario/fecha/2025-05-20

Headers:

css

Authorization: Bearer {{token_user}}
Ver citas pendientes (admin)
Method: GET

URL: {{base_url}}/citas/pendientes

Headers:

css

Authorization: Bearer {{token_admin}}
Aprobar cita (admin)
Method: PUT

URL: {{base_url}}/citas/123/aprobar

Headers:

css

Authorization: Bearer {{token_admin}}
Rechazar cita (admin)
Method: PUT

URL: {{base_url}}/citas/123/rechazar

Headers:

css

Authorization: Bearer {{token_admin}}
Ver reunión del profesional
Method: GET

URL: {{base_url}}/citas/reunion-profesional?fecha=2025-05-20

Headers:

css

Authorization: Bearer {{token_profesional}}
(Si el profesional inicia sesión con la ruta de usuario, usa token_user como token_profesional.)

Ver citas profesional por usuario
Method: GET

URL: {{base_url}}/citas/profesional/usuario/1

Headers:

css

Authorization: Bearer {{token_profesional}}
Ver citas profesional por fecha
Method: GET

URL: {{base_url}}/citas/profesional/fecha/2025-05-20

Headers:

css

Authorization: Bearer {{token_profesional}}

## Más información

* **Documentación de Prisma**: [https://www.prisma.io/docs](https://www.prisma.io/docs)
* **Express.js**: [https://expressjs.com/](https://expressjs.com/)

---


