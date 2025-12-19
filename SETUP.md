# Setup Rápido - Door Knocker

## Instalación

1. **Instala las dependencias:**
```bash
npm install
```

2. **Configura el token de Mapbox (Opcional pero recomendado):**

Crea un archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_de_mapbox
```

Obtén un token gratuito en: https://account.mapbox.com/access-tokens/

**Nota:** Si no proporcionas un token, la app usará un token público de ejemplo que puede tener limitaciones.

3. **Ejecuta el servidor de desarrollo:**
```bash
npm run dev
```

4. **Abre tu navegador en:**
```
http://localhost:3000
```

## Uso Básico

1. Ingresa una **industria** (ej: "restaurantes", "dentistas", "taller mecánico")
2. Ingresa una **ubicación** (ej: "Monterrey, Nuevo León", "Santa Catarina")
3. Ajusta el **radio** de búsqueda (1-50 km)
4. Selecciona el **número de prospectos** (25, 50, 75, 100, 150)
5. Presiona **LAUNCH SCAN**

## Características Implementadas

✅ Layout de 3 columnas (Control Panel, Map, Insights)
✅ Generación de leads mock aleatorios
✅ Visualización en mapa con Mapbox
✅ Panel de estadísticas y análisis
✅ Lista de leads con scores y estados
✅ Historial de misiones
✅ Consola de logs en tiempo real
✅ Animaciones y efectos visuales futuristas
✅ Diseño responsive

## Estructura del Proyecto

```
Door-Knocker/
├── app/
│   ├── globals.css          # Estilos globales y Tailwind
│   ├── layout.tsx           # Layout raíz
│   └── page.tsx             # Página principal
├── components/
│   ├── Layout/
│   │   └── Header.tsx       # Header con logo y estado
│   ├── control/
│   │   ├── MissionForm.tsx  # Formulario de parámetros
│   │   └── ConsoleLog.tsx   # Consola de logs
│   ├── map/
│   │   └── MapPanel.tsx     # Componente del mapa
│   └── insights/
│       ├── StatsPanel.tsx   # Panel de estadísticas
│       ├── LeadList.tsx     # Lista de leads
│       └── MissionsHistory.tsx # Historial
└── lib/
    ├── generateLeads.ts     # Lógica de generación de leads
    └── types.ts             # Tipos TypeScript
```

## Notas Técnicas

- Los datos son completamente simulados (mock)
- La geocodificación usa ubicaciones predefinidas para ciudades comunes
- En producción, se recomienda integrar APIs reales de geocodificación
- El diseño usa una paleta de colores futurista tipo sci-fi
- Todas las animaciones son CSS puro para mejor rendimiento






