# Porra Mundialista 2026 🏆

App web para el Mundial 2026: elige tus 10 selecciones, crea tu porra con amigos y compite por el mejor pronosticador.

## Stack

- **Next.js 14** (App Router + TypeScript)  
- **Firebase** (Firestore + Google Auth)  
- **worldcup26.ir** API para resultados en vivo  
- **Vercel** para el despliegue  

---

## 🚀 Setup paso a paso

### 1. Clona el repositorio

```bash
git clone https://github.com/TU_USUARIO/mundial2026-porra.git
cd mundial2026-porra
npm install
```

### 2. Crea el proyecto Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com/)
2. Crea un nuevo proyecto (ej: `mundial2026-porra`)
3. **Activa Firestore**:
   - Build → Firestore Database → Create database → Start in test mode
4. **Activa Google Auth**:
   - Build → Authentication → Get started → Sign-in method → Google → Enable
   - Añade tu dominio de Vercel en "Authorized domains" cuando lo tengas
5. **Obtén las credenciales**:
   - Project settings (⚙️) → Your apps → Add app (</>) → Register app
   - Copia el objeto `firebaseConfig`

### 3. Configura las variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con los valores de tu proyecto Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

### 4. Configura las reglas de Firestore

En Firebase Console → Firestore → Rules, copia estas reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Porras: cualquiera puede leer, solo autenticados pueden crear
    match /porras/{porraId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.createdBy;
      
      // Apuestas: cualquiera puede leer, solo el propio usuario puede crear (no editar)
      match /apuestas/{userId} {
        allow read: if true;
        allow create: if request.auth != null && request.auth.uid == userId;
        allow update: if false; // IRREVERSIBLE
        allow delete: if false; // IRREVERSIBLE
      }
    }
  }
}
```

### 5. Prueba en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 6. Sube a GitHub

```bash
git init
git add .
git commit -m "feat: initial commit - Porra Mundialista 2026"
git remote add origin https://github.com/TU_USUARIO/mundial2026-porra.git
git push -u origin main
```

### 7. Despliega en Vercel

1. Ve a [vercel.com](https://vercel.com) → Add New Project → Import from GitHub
2. Selecciona `mundial2026-porra`
3. En **Environment Variables**, añade las mismas variables de `.env.local`
4. Despliega 🚀
5. Copia la URL de Vercel y añádela en Firebase Console → Authentication → Authorized domains

---

## 📋 Sistema de puntuación

| Evento | Puntos |
|--------|--------|
| Victoria en fase de grupos | +3p |
| Empate en fase de grupos | +1p |
| 1º de grupo | +2p |
| 2º de grupo | +1p |
| 3º de grupo que pasa | +0.5p |
| Octavos de final | +3p |
| Cuartos de final | +5p |
| Semifinal | +8p |
| Final (llegar) | +10p |
| Ganar la final (campeón) | +12p |
| Ganar 3er puesto | +3p |
| MVP del Mundial (exacto) | +5p |
| Pichichi (exacto) | +5p |
| Guante de Oro (exacto) | +5p |
| Mejor Jugador Joven (exacto) | +5p |

**Presupuesto máximo:** 115 puntos para 10 selecciones.

---

## 🔑 Variables de entorno en Vercel

Añade en Vercel → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```
