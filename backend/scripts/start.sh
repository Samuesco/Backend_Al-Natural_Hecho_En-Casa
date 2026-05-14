#!/bin/sh
#!/bin/sh

echo "Esperando MySQL..."

sleep 10

echo "Generando Prisma..."

npx prisma generate

echo "Sincronizando schema..."

npx prisma db push

echo "Verificando base de datos..."

TABLES=$(mysql \
-h mysql \
-u root \
-proot \
-D natural_products \
-sse "SHOW TABLES;")

if [ -z "$TABLES" ]; then

    echo "Base de datos vacía"

    echo "Ejecutando seed..."

    npm run seed

else

    echo "Base de datos ya inicializada"

fi

echo "Iniciando backend..."

npm run dev