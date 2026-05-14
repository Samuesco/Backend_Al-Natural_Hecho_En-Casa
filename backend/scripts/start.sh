#!/bin/sh

echo "Esperando MySQL..."

sleep 10

echo "Generando Prisma..."

npx prisma generate

echo "Sincronizando schema..."

npx prisma db push

echo "Ejecutando seed..."

npm run seed

echo "Iniciando backend..."

npm run dev