# Home compacta — diseño corto

**Fecha:** 2026-11-11
**Repo:** `jparedesDS/jparedesDS.github.io`
**Estado:** pendiente de aprobación

## Intención

Reducir la home a la mitad de altura sin perder contenido, dejar Selected work en
3 proyectos, compactar Experience/Writing en dos columnas, ampliar el stack con
lo que hay en GitHub y añadir las redes @xhitoCS.

## Decisiones

1. **Hero al 50%.** De 606 px a ~303 px a 1440. Se reduce el padding vertical,
   el tamaño del `h1`, los márgenes del rol/intro/links y la tarjeta del retrato.
   El contenido y el retrato circular no cambian.
2. **Selected work: 3 tarjetas.** `subany.video`, `CleanYourPhone`,
   `CleanYourMail`. Salen DocFlow, Pro POV, trtw, HLTV, DXF y Welding de la home;
   siguen en `/work/` y con sus casos.
3. **Tarjetas.** 3 columnas en desktop, 1 en móvil; imagen 16:9; cuerpo más
   pequeño; fuera los chips de tecnologías. Cada tarjeta muestra:
   - **Web**: web oficial del proyecto.
   - **Skill**: repo de GitHub, solo en los proyectos que son skills de agente
     (CleanYourMail, CleanYourPhone).
   - **Code**: repo de GitHub en los demás, salvo que sea privado. Subany no
     tiene repo público, así que solo muestra Web.
4. **Experience + Writing en dos columnas.** Una línea horizontal compartida;
   timeline a la izquierda y writing a la derecha. Se compactan paddings y
   tipografía. A <=980 se apilan.
5. **Stack ampliado** con los lenguajes, temas y herramientas visibles en los 46
   repos de GitHub: Python, Jupyter, JavaScript, HTML/CSS, PyTorch,
   TensorFlow/Keras, YOLO, OpenCV, scikit-learn, Pandas, NumPy, NLP, Hugging
   Face, FastAPI, Flask, React, Docker, SQL, SQLite, PostgreSQL, GitHub Actions,
   Tableau, BeautifulSoup, ADB, WebGPU, Whisper, ONNX, FFmpeg, Claude, AI agents
   y local-first.
6. **Contacto** añade X e Instagram con `@xhitoCS` (TikTok no) y, en paralelo a
   la derecha, un segundo bloque de Pro POV CS2 con:
   - YouTube `https://www.youtube.com/@Pro.POV.CS2`
   - TikTok `https://www.tiktok.com/@propov.cs2`
   - Instagram `https://www.instagram.com/propovcs2`
   - X `https://x.com/ProPOVCS2`
   - Twitch `https://www.twitch.tv/propovcs2`
   - Kick `https://kick.com/propovcs2`

## Verificación

- Hero entre 280 y 330 px a 1440.
- 3 tarjetas, sin DocFlow/Pro POV en la home; 3 columnas a 1440, 1 a 360.
- CleanYourMail/CleanYourPhone muestran Web + Skill; subany solo Web (repo
  privado); no hay enlaces muertos.
- Experience/Writing en 2 columnas a 1440 y apiladas a 980/360.
- Stack contiene los tokens ampliados; Contact contiene X/Instagram/TikTok.
- Tests Node + Playwright + axe + 0 overflow a 360/768/1440.
- Revisión visual clara/oscura.
