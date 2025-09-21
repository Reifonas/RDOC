# Use Node.js 18 Alpine como base
FROM node:18-alpine AS base

# Instalar pnpm
RUN npm install -g pnpm

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN pnpm run build

# Estágio de produção
FROM node:18-alpine AS production

# Instalar pnpm e serve
RUN npm install -g pnpm serve

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos buildados
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./

# Expor porta
EXPOSE $PORT

# Comando para iniciar o servidor
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]