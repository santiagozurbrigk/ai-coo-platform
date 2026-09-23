# Estado de Limitless: resumen para el equipo

Resumen de una página para Agustín, Fernando, Martín, Santiago y Matías. Fecha: 2026-09-23. Responde al
pedido de Fernando del 23/09: tener un documento de requerimientos que diga exactamente lo que el software
hace, del que Martín arme el backlog.

## Qué hay y dónde

| Para qué | Dónde | Para quién |
|---|---|---|
| Qué puede hacer hoy el usuario en cada área y si funciona | [`FUNCIONAL.md`](./FUNCIONAL.md) | Agustín, Martín, Fernando |
| Todo lo pendiente, con prioridad y criterio de aceptación | [`../PENDIENTES.md`](../PENDIENTES.md) | Martín, devs |
| El mismo backlog listo para importar a Jira | [`backlog/jira-import.csv`](./backlog/jira-import.csv) · [cómo importarlo](./backlog/README.md) | Martín |
| Cómo está construido cada área | [`README.md`](./README.md) → `areas/`, `arquitectura/` | Fernando, devs |
| Qué falta probar a mano con cuentas reales | [`operacion/verificacion-manual.md`](./operacion/verificacion-manual.md) | quien pruebe |

Todo se contrastó contra el código del 23/09. En la base de producción sólo se miró la estructura, no los
datos de clientes.

## Cómo está cada área

228 funcionalidades en total: **110 funcionan**, 60 funcionan con fallas, 11 no funcionan, 21 están a medias
y 26 nunca se probaron con cuentas reales.

| Área | En una frase |
|---|---|
| **Producto** | La más sana: 13 de 15 funcionan. Los "insights" del avatar sólo repiten lo cargado |
| **Clientes** | Sólida: 21 de 28 funcionan. El onboarding por link nunca se usó en producción |
| **Operaciones y equipo** | Funciona casi todo, pero un miembro "desactivado" sigue entrando, y la tarifa por hora no tiene dónde cargarse |
| **Agente de IA** | El agente y la base de conocimiento andan. Reportes e inteligencia leen tablas viejas vacías, y el reporte mensual casi nunca sale |
| **Finanzas** | Anda, pero suma dólares y pesos sin convertir, y cualquier miembro puede editar montos |
| **Ventas** | La bandeja y Closing andan con fallas: Closing pierde los turnos más nuevos pasando los 1.000. La pantalla de Llamadas siempre está vacía, y las métricas de DMs, en cero |
| **Embudos** | El motor funciona, pero los avisos de pago de Whop, Commas y GoHighLevel se pueden perder sin aviso. VTurb, WebinarJam y Hyros nunca se probaron |
| **Marketing** | La más afectada: sin Zernio propio, una organización puede ver datos de la cuenta global de Zernio. Varias pantallas leen datos viejos de Instagram |
| **Plataforma** | Permisos sólo de fachada, "¿Olvidaste tu contraseña?" no hace nada y las notificaciones por mail no existen |
| **Discord** | Construido, pero nunca probado contra un servidor real |

## Lo grave: 9 problemas que van antes que cualquier cosa nueva (P0)

1. **Los permisos sólo esconden pantallas.** Un usuario de "solo lectura" puede borrar clientes, cambiar
   montos o editar permisos por detrás (`PERMISOS-SERVER-ACTIONS`, afecta a todas las áreas).
2. **El link de vuelta del login se puede usar para mandar a alguien a otro sitio** (`AUTH-CALLBACK-NEXT`).
3. **Los avisos de pago de Whop, Commas y GoHighLevel se pueden perder sin que nadie se entere** (`EMBUDOS-WEBHOOK-PERDIDA`).
4. **Un miembro desactivado sigue entrando y viendo todo** (`EQUIPO-DESACTIVAR-NO-BLOQUEA`).
5. **La pantalla de Llamadas de venta no muestra ninguna llamada** (`LLAMADAS-EMBED-ROTO`).
6. **Closing deja afuera los turnos más recientes cuando una organización pasa de 1.000** (`CLOSING-LIST-1000`).
7. **Una organización sin Zernio propio usa la cuenta global de Zernio** (`ZERNIO-KEY-GLOBAL`).
8. **Una organización sin clave de IA propia depende de una clave global que no está confirmada en Vercel** (`1A1-CLAVE-ANTHROPIC-ROTA`).
9. La parte de base de datos del punto 1: la base tampoco controla roles (`PERMISOS-SERVER-ACTIONS/infra`).

Ninguno está arreglado todavía: este trabajo fue de documentación, como se acordó con Fernando. Cada uno
tiene su criterio de aceptación en el backlog.

## Lo que Fernando temía: documentos que dicen una cosa y código que hace otra

Las especificaciones viejas (hoy en `docs/archivo/`) prometen cosas que no existen o existen distinto. Cada
área de `FUNCIONAL.md` las lista en "Prometido y no existe". Las más relevantes:

- Un panel general con riesgos, oportunidades y recomendaciones de IA: los componentes existen, pero no se muestran.
- Integraciones con Loom, Notion, Airtable y Google Docs/Sheets: no existen.
- Métricas de setters y detección automática de agendas: sólo hay métricas por closer y análisis manual.
- Comparador de embudos, semáforo de salud e historia por período: no existen en pantalla (el semáforo está calculado, pero no se muestra).
- Exportar reportes a PDF, detección de SOPs desactualizados, pronósticos: no existen.
- El super admin crea las cuentas a mano: en realidad, cualquiera puede crearse una cuenta desde el login.

## Lo que tiene que decidir Agustín

1. **Qué entra en octubre.** Completar la columna "Octubre" de `FUNCIONAL.md` (`Sí` / `No` / `Después`).
   Con eso se ordenan los primeros sprints.
2. **Siete decisiones de negocio que ya bloquean trabajo (P1):**
   - ¿El alta de cuentas es pública o sólo por invitación? (`SIGNUP-PUBLICO`)
   - Cuánto tiempo se guardan los mensajes de Discord de terceros (`E-RETENCION`)
   - Qué se hace con los clientes viejos sin mail (`CLIENTES-SIN-MAIL`)
   - Cómo se avisa que quien no tiene Ventas deja de ver montos en Clientes (`COBROS-AVISAR-PERMISOS`)
   - Si el dinero y los anuncios se miden por embudo o por organización (`EMBUDOS-MEDIDAS-POR-EMBUDO`)
   - Conseguir la API key de WebinarJam (`WEBINARJAM-API-KEY`)
   - Qué hacer con las organizaciones cuya clave de IA venció y gastan la global (`IA-CLAVES-INVALIDAS`)
3. **Prioridad de la investigación de librerías tipo HubSpot/Pipedrive/Salesforce** (`INVESTIGAR-LIBRERIAS-CRM`, hoy en P3).
4. **Jira o `PENDIENTES.md`: cuál manda** una vez importado el backlog.

Además, lo que quedó abierto en la reunión: el rol de Matías y las horas semanales de cada uno.

## Próximos pasos sugeridos

1. Agustín completa la columna Octubre y las decisiones de arriba.
2. Martín importa a Jira las primeras 90 filas del CSV (P0 y P1) y crea las épicas por área.
3. Fernando revisa los 9 P0 contra su propia auditoría de seguridad.
4. Con eso, se arman los dos sprints hasta la segunda semana de octubre: primero los P0, después los P1 de
   lo que Agustín marque para octubre.
