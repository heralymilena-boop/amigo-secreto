# 🎁 Amigo Secreto

Aplicación web simple para organizar sorteos de Amigo Secreto. Permite agregar participantes, evitar que alguien se asigne a sí mismo y exportar resultados.

## ✨ Funcionalidades
- Agregar / eliminar participantes
- Importar lista (pegando texto)
- Sorteo con **derangement** (nadie se asigna a sí mismo)
- Exportar CSV (participantes o resultados)
- Copiar resultados
- Persistencia con LocalStorage
- UI responsive

## 🚀 Cómo usar
1. Abre `index.html` en tu navegador (doble clic) — no requiere instalación.
2. Escribe un nombre y presiona **Agregar** (o usa **Importar** para pegar muchos).
3. Presiona **Sortear**. Verás pares en formato `A → B`.
4. Usa **Exportar .csv** o **Copiar** para compartir.

## 🧪 Reglas
- Se necesitan **al menos 2** participantes.
- El algoritmo evita que alguien se asigne a sí mismo.
- Si el sorteo no es posible (casos muy raros), intenta de nuevo con el botón **Sortear**.

## 🗂️ Estructura
```
amigo-secreto-starter/
├─ index.html
├─ src/
│  ├─ app.js
│  └─ styles.css
└─ docs/
   └─ screenshots/   # coloca aquí tus imágenes para el README
```

## 🖼️ Capturas (coloca las tuyas)
- Agregar nombres: `docs/screenshots/agregar-nombres.png`
- Resultados: `docs/screenshots/sorteo.png`

## 📄 Licencia
MIT
