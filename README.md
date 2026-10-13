# ThermoChip Lab

Simulador interactivo de semiconductores y temperatura. Prototipo conceptual del proyecto
**«Nanomateriales y semiconductores: el futuro de los dispositivos electrónicos»**
(Química General I · UNIBE · Ingeniería en TIC).

Toda la simulación se ejecuta en el navegador: sin backend, sin base de datos, sin conexión
a Internet (las tipografías van incluidas en el paquete).

## Puesta en marcha

Requisitos: Node.js 18 o superior.

```bash
npm install
```

```bash
npm run dev
```

Abre la URL que muestra la terminal (por defecto http://localhost:5173).

| Comando             | Acción                                             |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                             |
| `npm run build`     | Verificación de tipos + compilación en `dist/`     |
| `npm run preview`   | Sirve la versión compilada                         |
| `npm test`          | Pruebas unitarias de los cálculos científicos      |

La carpeta `dist/` usa rutas relativas y navegación por hash (`#/simulador`), así que puede
abrirse desde cualquier hosting estático.

## Módulos

1. **Inicio**: chip en vivo, controles rápidos y acceso a los módulos.
2. **Simulador térmico**: controles (carga, ambiente, refrigeración, material, protección
   térmica), chip con mapa de calor, indicadores en tiempo real, gráficas de temperatura y potencia.
3. **Química de semiconductores**: diagrama de bandas animado, Varshni, nᵢ(T), movilidad,
   fichas de Si, Ge, GaAs y perovskitas.
4. **Dopaje químico**: red cristalina del Si con P (tipo N) o B (tipo P), nivel de Fermi,
   portadores mayoritarios/minoritarios y conductividad frente a temperatura.
5. **Comparador**: propiedades publicadas de Si, Ge, GaAs y MAPbI₃.
6. **Nanomateriales y TIC**: escala nano, puntos cuánticos de CdSe (Brus vs. Yu et al.),
   arquitecturas planar/FinFET/GAA y aplicaciones.
7. **Resultados y sostenibilidad**: informe de la corrida, exportación CSV, resumen imprimible,
   energía de la refrigeración, envejecimiento (Arrhenius), costos y residuos electrónicos.
8. **Sobre el proyecto**: estructura para el póster y referencias.

## Modo presentación (`#/presentacion`)

Cinco escenarios para una demostración de 3–5 minutos:

| Tecla | Escenario | Qué mostrar |
| ----- | --------- | ----------- |
| `1`/`A` | Chip en reposo | Chip azul, ~25 °C |
| `2`/`B` | Carga intensiva | Sube progresivamente hacia ~85 °C |
| `3`/`C` | Refrigeración | Sin refrigeración llega al límite; cambiar a ventilador/avanzada |
| `4`/`D` | Semiconductores | Bandas de Si, Ge y GaAs a la misma escala y a la T del chip |
| `5`/`E` | Dopaje | Fósforo (tipo N) y boro (tipo P) |

`←`/`→` cambian de escenario, `Espacio` pausa, `F` pantalla completa, `Esc` sale.

## Modelo y rigor científico

- Modelo térmico: `C·dT/dt = P − (T − T_amb)/R`, integrado con Runge–Kutta 4 (paso 0,05 s simulados).
  Sin números aleatorios.
- `P = P_reposo + (P_máx − P_reposo)·carga`, con protección térmica opcional sobre 95 °C.
- El material sólo cambia la resistencia y capacidad térmica del dado (`R = t/(k·A)`, `C = ρ·c_p·V`):
  se compara un **diseño hipotético idéntico**; la temperatura depende sobre todo de la potencia y la refrigeración.
- Semiconductores: Varshni, `nᵢ = √(Nc·Nv)·exp(−Eg/2kT)`, `μ ∝ T^−γ`, neutralidad de carga,
  Caughey–Thomas, Brus, Yu et al. (2003), Arrhenius (JEP122).

Cada valor se etiqueta en la interfaz como **dato publicado**, **supuesto**, **calculado** o
**conceptual**. Los rangos de validez se muestran junto a cada ecuación.

## Estructura

```
src/
  data/        Valores físicos con unidades y referencias (materials, thermalConfig, references…)
  science/     Lógica científica pura + pruebas (*.test.ts)
  context/     Motor de simulación compartido (bucle requestAnimationFrame)
  components/  UI reutilizable, chip, gráficas, diagramas científicos
  content/     Textos dinámicos de «¿Qué está ocurriendo químicamente?»
  pages/       Una página por módulo + modo presentación
  utils/       Formato, colores, CSV
```

Para editar los nombres del equipo y de la docente: `src/data/project.ts`.

## Limitaciones

Modelo térmico de un nodo; fugas independientes de T; modelos de portadores válidos en 250–600 K
y dopaje no degenerado; visualizaciones de electrones, redes y mapas de calor conceptuales.
Los resultados son **simulados**, no mediciones de un procesador real.
