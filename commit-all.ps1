# Script para hacer commit y push de todos los cambios
Write-Host "Agregando todos los archivos..."
git add -A

Write-Host "Estado del repositorio:"
git status --short

Write-Host "Haciendo commit..."
git commit -m "feat: Complete backend with database, AI chat, and CRUD operations for leads

- Added Prisma ORM with SQLite database
- Created API routes for leads, chat, and missions
- Added AI chat component with OpenAI integration
- Added edit/delete functionality for leads
- Integrated database persistence for all leads and missions"

Write-Host "Haciendo push..."
git push origin main

Write-Host "Completado!"



