-- SQL script to create tables in Neon PostgreSQL
-- Run this in Neon SQL Editor if Prisma db push doesn't work

-- Create Lead table
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "industria" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "score" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- Create Contact table
CREATE TABLE IF NOT EXISTS "Contact" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "asunto" TEXT,
    "mensaje" TEXT,
    "enviado" BOOLEAN NOT NULL DEFAULT false,
    "enviadoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- Create ChatMessage table
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- Create Mission table
CREATE TABLE IF NOT EXISTS "Mission" (
    "id" TEXT NOT NULL,
    "industria" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "leadsCount" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Contact_leadId_idx" ON "Contact"("leadId");
CREATE INDEX IF NOT EXISTS "ChatMessage_leadId_idx" ON "ChatMessage"("leadId");
CREATE INDEX IF NOT EXISTS "Lead_score_idx" ON "Lead"("score");
CREATE INDEX IF NOT EXISTS "Lead_estado_idx" ON "Lead"("estado");



