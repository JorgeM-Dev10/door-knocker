-- Migration: Add Folder system for organizing leads
-- Run this in Neon SQL Editor

-- Create Folder table
CREATE TABLE IF NOT EXISTS "Folder" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- Add folderId and order columns to Lead table
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "folderId" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Add foreign key constraint
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "Lead_folderId_idx" ON "Lead"("folderId");

