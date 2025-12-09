# Door Knocker - Sapiens Laboratories

Radar de prospección inteligente que "toca puertas" en el mapa.

## Stack Tecnológico

- **Framework**: Next.js 14 + TypeScript
- **Estilos**: Tailwind CSS
- **Mapa**: Mapbox GL JS (react-map-gl)
- **Estado**: React Hooks

## Instalación

1. Instala las dependencias:

```bash
npm install
```

2. Configura tu token de Mapbox (opcional, pero recomendado):

Crea un archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_de_mapbox_aqui
```

Puedes obtener un token gratuito en [mapbox.com](https://www.mapbox.com/).

Si no proporcionas un token, la aplicación usará un token público de ejemplo (puede tener limitaciones).

3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

1. Ingresa una **industria** (ej: "restaurantes", "dentistas", "taller mecánico")
2. Ingresa una **ubicación** (ej: "Monterrey, Nuevo León", "Santa Catarina")
3. Ajusta el **radio de búsqueda** (en km)
4. Selecciona el **número de prospectos** a generar
5. Presiona **LAUNCH SCAN**

La aplicación generará leads aleatorios dentro del radio especificado y los mostrará en el mapa y en la lista de leads.

## Características

- Generación de leads mock con datos aleatorios
- Visualización en mapa con Mapbox
- Panel de estadísticas y análisis
- Historial de misiones
- Consola de logs en tiempo real
- Diseño futurista tipo sci-fi

## Notas

- Los datos son completamente simulados (mock)
- La geocodificación usa ubicaciones predefinidas para algunas ciudades comunes
- En producción, se recomienda integrar APIs reales de geocodificación y scraping




