# Work archive + contact sites — diseño corto

**Fecha:** 2026-11-11
**Repo:** `jparedesDS/jparedesDS.github.io`
**Estado:** aprobado por la petición del usuario

## Cambios

1. **`/work/` con formato de archive de blog.** Sustituir los grupos por
   categoría + modelos por un listado cronológico por año:
   - 2026, 2025, 2024, de más reciente a más antiguo.
   - 38 entradas: 28 proyectos + 10 model releases en el mismo listado.
   - Cabecera de año con contador; cada entrada muestra título, categoría
     (o `Model · versión`), enlaces y marca de privado cuando aplique.
   - Sin imágenes ni summaries, como el archive del blog.
   - Los 5 casos y CleanYourMail conservan sus enlaces internos; el resto
     enlaza a repos/modelos. Polymarket y demás privados, sin enlace.
   - Los redirects `/projects/<categoría>/` pasan a `/work/` sin hash.
2. **Cronología solo trabajo + estudios.** Quitar hitos, el periodo 2026 y
   Kaggle/DocFlow/YOLO/Pro POV de la sección. Título “Work & education”.
3. **Contacto: bloque Sites.** Subany, CleanYourMail.org y CleanYourPhone.org
   como cuarto bloque, a la derecha. Los `.org` aún no resuelven; se enlazan
   igualmente porque son los destinos pedidos.
4. **Cabecera:** el texto junto al icono pasa de “Jose Paredes” a
   “jparedesDS”.

## Verificación

- `/work/` 38 entradas, años 2026/2025/2024 en orden, sin grupos de categoría.
- 28 proyectos + 10 modelos; privados sin enlace; DocFlow sin datos sensibles.
- Timeline solo con EIPSA, Comunicación Permanente, The Bridge, ANOVO y
  Padre Piquer; sin “Milestone” ni “Kaggle”.
- Contacto con Subany, CleanYourMail.org y CleanYourPhone.org.
- Header con `jparedesDS`.
- 35+ tests Node, Playwright, axe, 0 overflow.
