# 📚 StudyForge · Sistema de estudio con Flashcards

**StudyForge** es una aplicación web minimalista y responsiva que permite crear, gestionar y estudiar tarjetas de memoria (flashcards) con un sistema de **repetición espaciada** (SM-2 simplificado).  
Ideal para estudiantes, autodidactas y profesionales que quieran repasar conceptos de manera eficiente.

---

## 🚀 Características

- ✅ **Gestión de mazos**: crear, renombrar y eliminar mazos.
- ✅ **CRUD de tarjetas**: agregar, editar y borrar preguntas/respuestas.
- ✅ **Repetición espaciada (SM-2)**: algoritmo para programar repasos según dificultad.
- ✅ **Sesión de estudio**: tarjetas flip con atajos de teclado (`F`, `1`, `2`, `3`).
- ✅ **Importar / Exportar JSON**: respaldo y portabilidad de tus mazos.
- ✅ **UI moderna**: Bootstrap 5, tema oscuro, responsive.
- ✅ **Persistencia local**: guarda automáticamente en `localStorage`.

---

## 🖼️ Capturas

> *(Agregá acá screenshots del sistema en acción, por ejemplo: página inicial, mazo con tarjetas, sesión de estudio.)*

---

## 📂 Estructura del proyecto

studyforge/
├─ public/
│ └─ index.html # HTML principal
├─ src/
│ ├─ app.js # Orquestador de la app
│ ├─ styles/
│ │ └─ main.css # Estilos personalizados
│ ├─ core/ # Lógica de negocio y estado
│ │ ├─ state.js
│ │ ├─ models.js
│ │ ├─ scheduler.js
│ │ └─ storage.js
│ └─ ui/ # Módulos de interfaz
│ ├─ dom.js
│ ├─ sidebar.js
│ ├─ deckView.js
│ ├─ modals.js
│ └─ studyView.js
└─ README.md


---

## 🛠️ Instalación y uso

### 1. Clonar el repo
```bash
git clone https://github.com/tuusuario/studyforge.git
cd studyforge


3. Abrir en el navegador

Ir a:

http://localhost:5173/public/index.html


⌨️ Atajos de teclado

F → voltear tarjeta.

1 → marcar como Difícil.

2 → marcar como Duda.

3 → marcar como Fácil.


🔮 Roadmap (ideas futuras)

 Estadísticas y gráficos de progreso.

 Filtro de tarjetas por etiquetas.

 Migrar a IndexedDB para grandes volúmenes.

 PWA: instalable en móvil y desktop.

 Modo colaborativo con sync en la nube.


📄 Licencia

MIT © 2025 — Creado por Tissera Franco