# De 0 a 100 con micro:STEAMakers

Manual de prácticas y retos para aprender a programar hardware real con la placa **ESP32 micro:STEAMakers** y **STEAMakersBlocks** (programación por bloques).

Material de la optativa **Robótica y Fabricación Digital I** (1.º de Bachillerato) del **IES Murillo** (Sevilla).

👉 **Web:** https://profetonino.github.io/ryfd1-microsteamakers/

## Qué incluye

- **Portada** con el mapa del camino (N0 → Reto 100) y cómo se evalúa.
- **Una página por nivel**: N0 (la placa y el entorno), N1 (secuencias y tiempo), N2 (variables), N3 (botones y decisiones), N4 (sensores y umbrales), Reto 50, N5 (sonido y bucles), N6 (listas), N7 (funciones e inclinación) y N8 (datos: medir, registrar y guardar). Los siguientes se irán añadiendo.
- En cada práctica: programa real en bloques, consola serie simulada, preguntas para interpretar los datos, retos en tres niveles (básico, medio, pro), «Bajo el capó» con el código C++ que generan los bloques y un test autocorregible.
- **Infografía interactiva de la placa** (cara frontal, trasera y pines de la placa de expansión Keyestudio).
- **Guía rápida** con los pines y las reglas de la consola serie.

Todo es HTML, CSS y JavaScript sin dependencias externas: funciona también sin conexión abriendo `index.html`.

## Estructura

```
index.html        portada
n0.html, n1.html… una página por nivel
guia.html         guía rápida
assets/           estilos.css y app.js (comunes a todas las páginas)
img/              imágenes de los programas y de la placa
```

## Créditos y licencia

- Autor: Juan Antonio Pérez Rodríguez (Departamento de Tecnología, IES Murillo).
- Textos, programas y código de la web: **CC BY-NC-SA 4.0** (ver `LICENSE.md`).
- Imágenes de la placa micro:STEAMakers (`img/placa_frente.webp`, `img/placa_detras.webp`): © Innova Didactic, utilizadas con su permiso. **No están incluidas en la licencia CC.**
- Correspondencia de pines de la placa de expansión: basada en la documentación de Federico Coca (fgcoca.github.io/ESP32-micro-STEAMakers).
