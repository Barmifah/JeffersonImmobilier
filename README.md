# Jefferson Immobilier

Application immobiliere React/Vite et Spring Boot/PostgreSQL.

## Prerequis

- Java 17
- Node.js 22 recommande
- PostgreSQL 16 ou Docker

## Configuration

Copier `.env.example` vers `.env` et remplacer les valeurs sensibles. Pour le frontend, configurer aussi `frontend/.env` a partir de `frontend/.env.example`.

Les variables principales sont :

- `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `JWT_SECRET`, `JWT_REFRESH_EXPIRATION_MS`
- `FRONTEND_URL`, `SEO_SITE_URL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Lancer en developpement

```powershell
# Base PostgreSQL uniquement
 docker compose up postgres

# Backend
 cd backend
 .\mvnw.cmd spring-boot:run

# Frontend, dans un autre terminal
 cd frontend
 npm install
 npm run dev
```

## Validation

```powershell
cd frontend
npm test
npm run lint
npm run build

cd ..\backend
.\mvnw.cmd test
```

## Docker

```powershell
docker compose up --build
```

- Frontend : `http://localhost:5173`
- API : `http://localhost:8080/api`
- Sitemap : `http://localhost:5173/sitemap.xml`
- Robots : `http://localhost:5173/robots.txt`
