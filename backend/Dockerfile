FROM node:22.22.2

# DIRECTORIO APP

WORKDIR /app

# COPIAR PACKAGE FILES

COPY package*.json ./

# INSTALAR DEPENDENCIAS

RUN npm install

# COPIAR PROYECTO

COPY . .

# PRISMA CLIENT

RUN npx prisma generate

# INSTALAR UTILIDADES
#
# - curl -> healthchecks
# - gzip -> backups comprimidos
# - default-mysql-client -> restore mysql
#

RUN apt-get update && apt-get install -y \

    curl \

    gzip \

    default-mysql-client

# DAR PERMISOS SCRIPT

RUN chmod +x ./scripts/start.sh

# PUERTO

EXPOSE 3000

# START

CMD ["sh", "./scripts/start.sh"]