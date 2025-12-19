# Configuración de Base de Datos y Backend

## Instalación

1. **Instala las dependencias:**
```bash
npm install
```

2. **Configura Prisma:**
```bash
npx prisma generate
npx prisma db push
```

3. **Configura variables de entorno:**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Mapbox Token (ya configurado)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoic2FwaWVuc2xhYm9yYXRvcmllcyIsImEiOiJjbWlqa2FiYjcxNG12M2Zvc3BlNGhka2tnIn0.7JxGTxySZAl3kP9JS5h6vw

# OpenAI API Key (para el chat con IA)
OPENAI_API_KEY=tu_openai_api_key_aqui
```

Puedes obtener una API key de OpenAI en: https://platform.openai.com/api-keys

4. **Ejecuta el servidor:**
```bash
npm run dev
```

## Funcionalidades Agregadas

### ✅ Base de Datos
- SQLite con Prisma ORM
- Modelos: Lead, Contact, ChatMessage, Mission
- Persistencia de datos entre sesiones

### ✅ Backend API
- `GET /api/leads` - Obtener todos los leads
- `POST /api/leads` - Crear un nuevo lead
- `GET /api/leads/[id]` - Obtener un lead específico
- `PUT /api/leads/[id]` - Actualizar un lead
- `DELETE /api/leads/[id]` - Eliminar un lead
- `POST /api/chat` - Enviar mensaje al chat con IA
- `GET /api/chat` - Obtener historial de chat
- `GET /api/missions` - Obtener misiones
- `POST /api/missions` - Crear misión

### ✅ Chat con IA
- Componente `AIChat` integrado
- Comandos especiales:
  - "¿Cuáles tienen correo bueno?" - Filtra leads con email y score alto
  - "Mándales correo" - Prepara correos para envío
- Integración con OpenAI GPT-3.5-turbo

### ✅ Editar/Borrar Leads
- Botones de editar y borrar en cada lead
- Modal de edición con todos los campos
- Confirmación antes de borrar

## Estructura de la Base de Datos

### Lead
- id, nombre, industria, direccion
- lat, lng, score, estado
- email, telefono, notas (opcionales)
- createdAt, updatedAt

### Contact
- id, leadId, email, nombre
- asunto, mensaje, enviado
- enviadoAt, createdAt

### ChatMessage
- id, leadId (opcional)
- role ('user' | 'assistant')
- content, metadata
- createdAt

### Mission
- id, industria, ubicacion
- leadsCount, fecha, createdAt

## Notas

- La base de datos SQLite se crea automáticamente en `prisma/dev.db`
- Los leads se guardan automáticamente cuando se genera un escaneo
- El chat con IA requiere una API key de OpenAI válida
- Si no tienes OpenAI API key, el chat funcionará pero con funcionalidad limitada





