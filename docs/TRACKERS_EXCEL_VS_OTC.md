# Los dos Excel contra lo que construimos

> Análisis del **Tracker de Clientes** y el **Tracker de Wins** (los entregables
> que hoy usan los clientes) contra los módulos que se construyeron en OTC.
>
> Escrito el 2026-09-04, leyendo los dos archivos completos —incluidas las hojas
> de instrucciones, que es donde está el criterio real.

---

## La diferencia de fondo, en una frase

**Los Excel son un ritual. OTC es un estado.**

El Excel te dice *cuándo mirar* y *qué preguntarte*. OTC te dice *cómo están las
cosas ahora*. Son dos mitades distintas y **la que falta es la del ritual**:

> *"Trackear sin revisar es exactamente igual que no trackear."*
> — hoja "Cómo usar" del Tracker de Clientes

Todo lo que sigue se ordena alrededor de eso.

---

# 1 · Tracker de CLIENTES

## Lo que OTC hace mejor que el Excel

| El Excel | OTC |
|---|---|
| Te obliga a preguntar a mano *"¿quién no se movió en 2 semanas?"* | El checkpoint tiene **plazo esperado** y el cliente aparece **trabado solo** |
| El estado del cliente se actualiza a mano | Un checkpoint puede **mover el estado solo** al alcanzarse |
| Las llamadas se cargan a mano, con link pegado | Se **enganchan solas** desde Fathom, con transcripción y resumen |
| No tiene señal de riesgo por silencio | El **silencio en Discord** marca al cliente que dejó de aparecer |
| Cambiar una columna = tocar el archivo de todos | **Campos configurables** desde una pantalla |
| Las fases son una lista fija | Fases **con color, orden y plazo**, y los hitos adentro |

## 🔴 Lo que el Excel tiene y a OTC le falta

### 1. El objetivo con el que entró — **el hueco más grande**

> *"El 'Objetivo inicial' se completa en el onboarding, no después. Es el dato que
> te permite cerrar el programa sabiendo si se cumplió o no."*

El Excel guarda **Objetivo inicial** (en palabras) y **Métrica objetivo** (el
número). OTC guarda de dónde partió (`baseline`) y dónde está hoy, pero **no a
dónde iba**.

Sin eso, la pregunta *"¿qué proporción está llegando al objetivo con el que
entró?"* —una de las cuatro de la revisión mensual— **no se puede responder**. Y
es la pregunta que dice si el producto funciona.

**Propuesta:** `clients.goal_text` + `goal_metric_key` + `goal_metric_value`, al
lado del baseline que ya existe. Con eso el recorrido pasa de *"500 → 8.500"* a
*"500 → 8.500 de 10.000"*, que es otra cosa.

### 2. La revisión semanal — **el ritual que falta entero**

Cuatro preguntas, 15 minutos, y *"tiene que terminar en una lista de nombres con
una acción para cada uno"*:

| # | Pregunta | ¿OTC puede responderla hoy? |
|---|---|---|
| 1 | ¿Quién no se movió en 2 semanas? | ✅ **Sí** — es "trabado" (C3) |
| 2 | ¿Quién está por tener un resultado? | ⚠️ Parcial — hay wins, falta "viene subiendo" |
| 3 | ¿Quién está a menos de 2 meses del egreso? | ❌ **No** — falta la fecha de egreso |
| 4 | ¿Quién está en riesgo? | ⚠️ Parcial — hay pago atrasado y silencio, sin juntar |

**OTC ya tiene los datos de tres de las cuatro y no las muestra juntas en ningún
lado.** Falta la pantalla, no el dato.

**Propuesta:** una pantalla **Revisión semanal** con las cuatro preguntas como
secciones, cada una con su lista de nombres y un lugar para anotar la acción. Es
la pieza de mayor valor por esfuerzo de todo este análisis.

### 3. La fecha de egreso

Alimenta la pregunta 3 y la conversación de renovación. Existe
`plan_durations`, pero **no como fecha de salida del recorrido**.

**Propuesta:** `clients.exit_date`, calculada de la duración del plan y editable.

### 4. El estado actual en palabras

El Excel tiene **Estado actual** (texto libre: *"Armó la oferta nueva. Trabado en
el guion"*) que se pisa cada mes. OTC tiene hitos alcanzados, que es otra cosa: un
hito dice qué pasó, no **dónde está parado hoy**.

**Propuesta:** `clients.current_status_note` + `current_metric_value`, con fecha de
última actualización. Es el campo que el CSM toca cada semana.

### 5. Próximos pasos por llamada de entrega

El Excel cierra **toda** llamada con próximos pasos. En OTC eso existe **sólo para
leads** (`sales_leads.next_action`); las llamadas de entrega no tienen dónde.

### 6. El responsable de cada cliente

El Excel tiene coach/responsable en la Config. OTC no asigna clientes a personas.

### 7. Dos formas de negocio

El Excel ofrece **1-a-1** (completo, con llamadas) y **simplificado** (mentoría de
volumen, sin llamadas individuales). OTC asume una sola forma.

---

# 2 · Tracker de WINS

## Lo que OTC hace mejor

| El Excel | OTC |
|---|---|
| Punto A y punto B se escriben a mano | Se **calculan solos** de los wins con medida |
| Si faltan datos, la celda queda vacía | Dice **"sin medir"** y **por qué** |
| La captura es un link pegado a Drive | Bucket **privado** con URL firmada |
| Las listas se editan en la hoja Config | **Campos configurables** desde la pantalla |
| Los wins se cargan sólo a mano | Un testimonio de Discord se convierte en win **con un click** |

## 🔴 Lo que le falta a OTC

### 1. Los permisos del cliente — **el hueco más grave de los dos archivos**

La Ficha de Caso tiene dos campos que OTC **no tiene en ninguna forma**:

- **¿Autorizó uso público?** Sí / No
- **¿Cómo quiere aparecer?** nombre y cara / nombre sin números / solo números anónimo / **no autoriza**

Y en el Log de Wins, cada fila tiene su columna **"Cómo aparece"**.

**Esto no es una mejora, es una falta.** Hoy OTC te deja registrar el resultado de
un cliente y usarlo en una landing **sin ningún lugar donde conste que dio
permiso**. Con datos de facturación de personas reales, eso es un problema
concreto — y la solución es una columna.

**Propuesta, y la pondría antes que todo lo demás:** `client_wins.consent_status`
(`no_preguntado` / `autorizado` / `rechazado`) + `consent_display`
(`nombre_y_cara` / `nombre_sin_numeros` / `anonimo`), **con el dashboard filtrando
por defecto los que no autorizaron** y avisando en vez de mostrarlos.

### 2. Estado de uso — la diferencia entre registrar y recordar

> *"Un resultado que no se convierte en marketing es un resultado desperdiciado.
> Este archivo existe para que ninguno se te escape."*

El Excel tiene **Estado de uso**: `Sin usar` / `Usada` / `Reservada`. OTC tiene
"dónde se usó" (`win_usages`), que es el registro **de los que sí se usaron**.

La diferencia es todo: **el Excel te muestra los que NO usaste todavía.** OTC no
puede responder *"¿qué wins tengo sin aprovechar?"*, que es la razón de ser del
archivo.

**Propuesta:** un estado por win, derivable de `win_usages` (sin usos = sin usar)
más un `reservado` explícito, y un filtro **"Sin usar"** como pill del tracker.

### 3. El checklist de contenido — un caso rinde 10 piezas

> *"Que un caso se use una sola vez. De uno bien documentado salen 10 piezas."*

La hoja Casos de Éxito tiene seis casillas por caso: **Historia 1, Historia 2,
Carrusel, Reel, Entrevista, Creencia rota**. Sirven porque **muestran lo que
falta**, no lo que se hizo.

En OTC, `win_usages` son filas libres: registran lo hecho y no señalan el hueco.

**Propuesta:** para los casos documentados, el mismo checklist como casillas. La
lista de canales sale de un campo configurable de C0, así cada uno pone los suyos.

### 4. Caso de éxito ≠ win — falta la entidad curada

El Excel separa **Log de wins** (todo, chico y grande, todos los días) de **Casos
de éxito** (*"los 3-4 por trimestre que documentás en serio"*). OTC los mezcla:
todo es un win.

**Propuesta:** `client_wins.is_case_study` y una tercera solapa "Casos". El
dashboard actual ya es casi eso: sería filtrarlo por los marcados.

### 5. La ficha de caso — lo que más marketing produce

La plantilla tiene una estructura que OTC reduce a **un campo de texto**
(`achievement`):

| Bloque | Campos |
|---|---|
| **La situación previa** | ⭐ **Creencias** (*"esta parte es oro para el marketing"*), problemas, cuellos de botella |
| **El logro** | Qué consiguió con números, punto A, punto B, plazo, ⭐ **restricciones** |
| **El proceso** | Paso 1, 2, 3 |
| **Quién es** | Nombre, perfil/red, **otros involucrados**, nicho |
| **Recursos** | Carpeta de capturas, link al testimonio en video |

Dos que valen aparte:

- **Creencias** — *"qué creía que era verdad y no lo era"*. Es el material del que sale el contenido de creencia rota, y **no tiene lugar en OTC**.
- **Restricciones** — *"todo orgánico, sin lanzamientos, 1 oferta, 1 funnel"*. Es **lo que hace creíble el número**. Sin eso, "+180.000 USD" es una cifra que nadie cree.

**Propuesta:** una ficha de caso como documento estructurado, con esos bloques, que
se completa **con** el cliente. Reusa `field_definitions` de C0: cada bloque es un
conjunto de campos configurables de entidad `case_study`.

### 6. "Captura sacada" es una pregunta, no un archivo

> *"Sacá la captura el día que la publican, no cuando la vas a usar. Si la sacás
> después, la pantalla muestra la fecha vieja y le resta."*

El Excel tiene **Captura sacada (Sí/No)** *además* del link, porque lo que importa
es saber **cuáles están pendientes**. OTC tiene el adjunto o no lo tiene, sin
señal de que falte.

**Propuesta:** marcar el win como "necesita captura" y mostrarlo en el tracker.

### 7. Punto A y B admiten rangos

El Excel escribe *"5-10k/mes"* → *"+40k/mes"*. OTC **exige un número**.

Ser estricto es lo correcto para el dashboard —permite restar y calcular el
plazo—, pero **el caso de éxito publicable usa el rango**. Los dos conviven: el
número para medir, el texto para publicar.

---

# 3 · Dos advertencias del Excel que OTC debería respetar

### *"No agregues columnas 'por las dudas'"*

> *"Todo lo que no vas a mirar es ruido, y un tracker con veinte columnas se
> abandona en un mes."*

**C0 hace exactamente eso posible.** Los campos configurables son la respuesta
correcta a "no quiero tocar código", pero también quitan la fricción que impedía
llenar la pantalla de columnas muertas.

**Propuesta:** que la pantalla de campos muestre **cuántos datos tiene cargados
cada columna**. Una con cero usos después de un mes se ofrece para archivar.

### *"No lo cargues vos"*

> *"Esto lo mantiene tu asistente o tu CSM. Tu trabajo es diseñar el sistema y
> leer las conclusiones."*

Hay una separación de roles explícita: el founder **configura y lee**, el
asistente **carga**. Hoy OTC hace lo contrario en C0/C1: **sólo el founder puede
configurar**, pero también es el único con la pantalla más cómoda para cargar.

**Propuesta:** revisar los permisos con esa lente. Configurar = founder. Cargar =
cualquiera del equipo. Ya es así en C2 (registrar checkpoints) y **no** en A
(wins).

---

# 4 · Qué haría primero

Ordenado por valor sobre esfuerzo:

| # | Qué | Por qué |
|---|---|---|
| 1 | 🔴 **Permisos del cliente en los wins** | Es una falta, no una mejora. Chico y urgente |
| 2 | **Pantalla de Revisión semanal** | El ritual que falta entero. OTC ya tiene 3 de las 4 respuestas |
| 3 | **Estado de uso + filtro "Sin usar"** | Es la razón de ser del tracker de wins y hoy no se puede preguntar |
| 4 | **Objetivo inicial y métrica objetivo** | Sin la meta no se puede cerrar un programa ni medir el producto |
| 5 | **Fecha de egreso** | Desbloquea la pregunta 3 y la renovación |
| 6 | **Ficha de caso** (creencias, restricciones, proceso) | Lo que más marketing produce por caso |
| 7 | **Checklist de contenido por caso** | Convierte el registro en recordatorio |
| 8 | **Estado actual en palabras** | El campo que el CSM toca cada semana |
| 9 | **Revisión mensual de patrones** | La lectura del producto, no del cliente |
| 10 | **Caso de éxito como entidad curada** | Separa el log del material publicable |

Los cinco primeros son **una migración chica y dos pantallas**. El resto es
producto nuevo.

---

*Los dos Excel están mejor pensados de lo que un software suele reconocer: cada
columna tiene una razón escrita y cada hoja dice para qué sirve. Lo que OTC aporta
es que las señales se calculen solas; lo que le falta es el ritual que hace que
alguien las mire.*
