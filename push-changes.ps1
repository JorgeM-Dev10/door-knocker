Write-Host "=== Verificando estado del repositorio ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Agregando todos los archivos ===" -ForegroundColor Cyan
git add -A

Write-Host "`n=== Archivos agregados ===" -ForegroundColor Green
git status --short

Write-Host "`n=== Haciendo commit ===" -ForegroundColor Cyan
git commit -m "feat: Complete backend implementation

- Added Prisma ORM with SQLite database
- Created API routes: /api/leads, /api/chat, /api/missions
- Added AI chat component with OpenAI integration
- Added edit/delete functionality for leads
- Integrated database persistence
- Added EditLeadModal component
- Updated LeadList with edit/delete buttons
- Updated page.tsx to save leads to database"

Write-Host "`n=== Haciendo push a GitHub ===" -ForegroundColor Cyan
git push origin main

Write-Host "`n=== Verificando estado final ===" -ForegroundColor Cyan
git status

Write-Host "`n=== COMPLETADO ===" -ForegroundColor Green





