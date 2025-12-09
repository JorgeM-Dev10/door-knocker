# Instrucciones para hacer Commit y Push

Si los cambios no aparecen en GitHub, ejecuta estos comandos manualmente:

## 1. Verificar estado
```bash
git status
```

## 2. Agregar todos los archivos
```bash
git add -A
```

## 3. Verificar qué se va a commitear
```bash
git status
```

## 4. Hacer commit
```bash
git commit -m "feat: Complete backend implementation with database, AI chat, and CRUD operations

- Added Prisma ORM with SQLite database
- Created API routes: /api/leads, /api/chat, /api/missions  
- Added AI chat component with OpenAI integration
- Added edit/delete functionality for leads
- Integrated database persistence for all leads
- Added EditLeadModal component
- Updated LeadList with edit/delete buttons
- Updated page.tsx to save leads to database automatically"
```

## 5. Hacer push
```bash
git push origin main
```

## Archivos nuevos que deben estar en el commit:

### Backend:
- `prisma/schema.prisma`
- `lib/prisma.ts`
- `app/api/leads/route.ts`
- `app/api/leads/[id]/route.ts`
- `app/api/chat/route.ts`
- `app/api/missions/route.ts`

### Componentes:
- `components/chat/AIChat.tsx`
- `components/insights/EditLeadModal.tsx`

### Archivos modificados:
- `app/page.tsx`
- `components/insights/LeadList.tsx`
- `package.json`
- `.gitignore`

### Documentación:
- `SETUP_DATABASE.md`

## Si el push falla:

1. Verifica la conexión remota:
```bash
git remote -v
```

2. Si necesitas forzar (cuidado):
```bash
git push origin main --force
```

3. Verifica los logs:
```bash
git log --oneline -5
```



