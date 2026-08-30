---
title: "Release Notes"
source: "https://vturb.gitbook.io/analytics-api/pt/release-notes"
idioma: "pt"
capturado: "2026-08-30"
---

# Release Notes

### Versão 1.7.1 (2026-05-07)

#### Correções de Bugs

* **`/headlines/stats_by_player`, `/turbo/stats_by_player`, `/smart_autoplays/stats_by_player` agora respeitam `end_date`**: Os três endpoints estavam descartando silenciosamente o parâmetro `end_date` e sempre retornavam dados de `start_date` até "agora", produzindo totais quase cumulativos inflados — mais visível quando o cliente pedia uma janela curta no passado. Agora `end_date` é aplicado como limite superior em `events.created_at`, `sessions.created_at`, `times.created_at` e `conversions.click_created_at`. O limite é inclusivo até o fim do minuto, então passar `23:59:59` (ou `23:59:59.999`) no último minuto do dia captura todos os eventos daquele dia. `end_date` continua opcional — clientes que não enviam (ou enviam em branco) mantêm o comportamento ilimitado anterior, então integrações existentes não quebram; se `end_date` for enviado mas malformado a requisição retorna `400`.

***

### Versão 1.7.0 (2026-04-27)

#### Novas Funcionalidades

* **Novo endpoint `GET /quota/usage`**: Retorna o estado atual da cota do ClickHouse para a sua API key — uma entrada por janela de cota (tipicamente uma por minuto e outra por dia). Em cada janela você recebe `interval_seconds`, `interval_starts_at`, `interval_ends_at` e `{ used, limit, remaining }` para `queries` e `read_bytes`. Use no cliente para se auto-limitar antes de disparar requisições analíticas pesadas.

  Observações:

  * Quando o ClickHouse define a cota como ilimitada (valor bruto `0`), a resposta usa `limit: null` e `remaining: null` para você não dividir por zero.
  * Uma única chamada à API pode contar como mais de uma query contra `max_queries_per_minute`, então esse contador pode subir mais rápido que a sua taxa real de requisições. A resposta inclui `queries.note` para sinalizar isso. O `read_bytes` reflete o volume de dados efetivamente lido e é o sinal mais confiável para dimensionar o seu uso.
  * O próprio endpoint conta como 1 query contra `max_queries_per_minute`.

  ```
  GET /quota/usage
  ```

  ```json
  {
    "quotas": [
      {
        "interval_seconds": 60,
        "interval_starts_at": "2026-04-27T12:34:00Z",
        "interval_ends_at":   "2026-04-27T12:35:00Z",
        "queries":    { "used": 20, "limit": 60, "remaining": 40, "note": "a single API request may count as more than one query against this limit" },
        "read_bytes": { "used": 92535478, "limit": null, "remaining": null }
      }
    ]
  }
  ```

#### Melhorias

* **Campo `details` estruturado em `429 Too Many Requests`**: Quando uma requisição falha por exaustão de cota no ClickHouse (`code: 201`), a resposta agora inclui um objeto `details` ao lado do `error` já existente:

  ```json
  {
    "error": "Query quota exceeded for this API key. ...",
    "code": 201,
    "details": {
      "limit_kind": "queries",
      "used": 60,
      "limit": 60,
      "remaining": 0,
      "interval_seconds": 60,
      "resets_at": "2026-04-27T12:35:00Z"
    }
  }
  ```

  Os campos `error` e `code` continuam idênticos, então clientes existentes que dependem deles seguem funcionando. SDKs e dashboards agora podem exibir "tente novamente em `resets_at`" em vez de tratar o throttle como opaco.

***

### Versão 1.6.0 (2026-04-27)

#### Novas Funcionalidades

* **Busca por nome no `/players/list`**: O endpoint agora aceita um filtro opcional `name` e um modo opcional `name_match` (`contains` (padrão), `starts_with`, `ends_with` ou `exact`). A busca é case-insensitive — inclusive para acentos (`JOSÉ` casa com `José Silva`). Caracteres especiais como `%`, `_`, `\` e `[]` são tratados como literais, então uma consulta como `name=[campaign_1]` retorna apenas players cujo nome contém exatamente essa tag. `name` deve ter **entre 3 e 128 caracteres** após remover espaços nas pontas; enviar `name_match` sem `name` retorna 400.

**Exemplo de uso**

```
GET /players/list?name=campaign_1
GET /players/list?name=BF&name_match=starts_with
GET /players/list?name=_v2&name_match=ends_with
GET /players/list?name=[VSL]%20Black%20Friday&name_match=exact
```

***

### Versão 1.5.0 (2026-04-20)

#### Novas Funcionalidades

* **Novo endpoint `/comparison_groups/list`**: Lista os testes A/B (comparison groups) cadastrados na sua conta. Cada item traz o nome do teste, os players participantes com suas respectivas porcentagens de tráfego e as datas de início/fim. Resultados ordenados pela data de criação (mais recentes primeiro) e filtráveis por `start_date` e `end_date` opcionais.
* **Novo endpoint `/comparison_groups/stats`**: Retorna o conjunto completo de métricas de analytics para até **2** players de um teste A/B em uma única requisição — views, plays, finishes, clicks, conversões (com receita em USD, BRL e EUR), engagement, pitch retention e as taxas derivadas de play rate, conversion rate e receita por visitante (RPV). O `start_date` de cada item é opcional — quando ausente, usa como padrão o `started_at` do próprio player no comparison group e, se ele também estiver nulo, o `started_at` do teste A/B. Quando `end_date` é omitido, o resultado considera até o momento atual.

**Requisição**

* Até 2 `items` por requisição (testes A/B são comparados aos pares).
* Cada item: `{ player_id (obrigatório), start_date (YYYY-MM-DD HH:MM:SS, opcional), end_date (opcional) }`.
* `events` é opcional e tem como padrão `["started", "viewed", "finished"]`.
* `timezone` é opcional (padrão `Etc/UTC`). Quando informado, todas as strings de `start_date` / `end_date` — as que você passa em `items` e as resolvidas por padrão a partir do comparison group — são interpretadas neste fuso no momento da consulta.

**Resposta**

```json
{
  "comparison_group": {
    "id": "...",
    "name": "...",
    "player_ids": [
      "...",
      "..."
    ],
    "started_at": "2026-02-26 00:41:00",
    "finished_at": null
  },
  "stats": [
    {
      "player_id": "...",
      "pitch_time": 1317,
      "video_duration": 1732,
      "views": {
        "total": 12626,
        "total_uniq_sessions": 11491,
        "total_uniq_device": 11411
      },
      "plays": {
        "total": 9984,
        "total_uniq_sessions": 9587,
        "total_uniq_device": 9574
      },
      "finishes": {
        "total": 286,
        "total_uniq_sessions": 284,
        "total_uniq_device": 283
      },
      "clicks": {
        "total": 515,
        "total_uniq_sessions": 488,
        "total_uniq_device": 485
      },
      "conversions": {
        "total": 17,
        "total_uniq_sessions": 17,
        "total_uniq_device": 17,
        "total_amount_usd": 3740.0,
        "total_amount_brl": 19329.57,
        "total_amount_eur": 3179.82
      },
      "engagement": {
        "average_watched_time": 842.3,
        "engagement_rate": 48.63,
        "grouped_timed": [
          {
            "timed": 0,
            "total_users": 1420
          },
          {
            "timed": 5,
            "total_users": 980
          }
        ]
      },
      "pitch_audience": 2411,
      "pitch_retention_rate": 23.57,
      "play_rate": 83.89,
      "conversion_rate": 0.18,
      "rpv_usd": 0.3907,
      "rpv_brl": 2.019,
      "rpv_eur": 0.3322
    }
  ]
}
```

* `comparison_group.player_ids` devolve todos os players cadastrados no teste, mesmo quando você pede estatísticas de apenas um subconjunto.
* Items cujo `player_id` não pertence ao comparison group são descartados silenciosamente; a requisição falha com `422` apenas quando não sobra nenhum item válido.
* Um `comparison_group_id` que não pertence à sua conta retorna `404`.
* Os campos de receita (`conversions.total_amount_{usd,brl,eur}` e `rpv_{usd,brl,eur}`) são retornados em unidades principais (dólares, reais, euros) como floats — ex.: `3740.0` significa USD $3.740,00.

**Exemplo de uso**

```bash
# 1. Listar os testes A/B da empresa
curl -X POST https://{host}/comparison_groups/list \
  -H 'X-Api-Token: <token>' \
  -H 'X-Api-Version: v1' \
  -H 'Content-Type: application/json' \
  -d '{"start_date":"2026-01-01 00:00:00"}'

# 2. Obter estatísticas de até 2 players
curl -X POST https://{host}/comparison_groups/stats \
  -H 'X-Api-Token: <token>' \
  -H 'X-Api-Version: v1' \
  -H 'Content-Type: application/json' \
  -d '{
        "comparison_group_id": "699f9683dfeab82d6246e13b",
        "items": [
          {"player_id": "699f92f01dd8bb9e2b6aab3a", "start_date": "2026-02-26 00:41:00"},
          {"player_id": "699f9363c4b02ade5c5f1881", "start_date": "2026-02-26 00:41:00"}
        ]
      }'
```

***

### Versão 1.4.1 (2025-08-01)

#### Correções de Bugs

* **O endpoint `/sessions/live_users`** tinha um problema onde o cache estava sendo mantido por 60 minutos como padrão. A correção inclui agora um cache que usa uma estratégia de 30 segundos de cache com revalidação a cada 15 segundos. Isso deve ser suficiente para consultar usuários ativos.

***

### Versão 1.4.0 (2025-07-29)

#### Novas Funcionalidades

* **Novo endpoint `/sessions/live_users`**: Adicionada funcionalidade de rastreamento de usuários ativos em tempo real que fornece análises baseadas em domínio de usuários atualmente ativos:
  * **Rastreamento de atividade em tempo real**: Monitora atividade do usuário dentro de uma janela de tempo configurável (1-720 minutos)
  * **Agrupamento baseado em domínio**: Agrupa usuários ativos por domínio para entender a distribuição de tráfego
  * **Validação de sessão**: Conta apenas sessões dos últimos 12 horas com atividade recente
  * **Filtro de bots**: Exclui automaticamente tráfego de bots para contagens precisas de usuários
  * **Resultados ordenados**: Retorna domínios ordenados por contagem de usuários ativos em ordem decrescente

**Exemplo de Uso**

```bash
# Obter usuários ativos dos últimos 60 minutos (padrão)
GET /sessions/live_users?player_id=64a5c8072e6fd10009828db2

# Obter usuários ativos dos últimos 30 minutos
GET /sessions/live_users?player_id=64a5c8072e6fd10009828db2&minutes=30

# Obter usuários ativos das últimas 2 horas
GET /sessions/live_users?player_id=64a5c8072e6fd10009828db2&minutes=120
```

**Detalhes dos Parâmetros**

* **`player_id`** (obrigatório): O ID do player para monitorar atividade de usuários ativos
* **`minutes`** (opcional): Janela de tempo em minutos para considerar atividade recente. Deve estar entre 1 e 720. Padrão de 60 minutos

**Formato de Resposta**

```json
[
  {
    "domain": "example.com",
    "live_users": 15
  },
  {
    "domain": "test.com",
    "live_users": 8
  },
  {
    "domain": "another-site.com",
    "live_users": 3
  }
]
```

**Entendendo o Rastreamento de Usuários Ativos**

O endpoint funciona da seguinte forma:

1. **Filtro de Sessões**: Identifica sessões dos últimos 12 horas que não são de bots
2. **Validação de Atividade**: Verifica atividade recente (registros de times) dentro da janela de minutos especificada
3. **Agrupamento por Domínio**: Agrupa sessões ativas por domínio
4. **Agregação de Contagem**: Conta sessões únicas por domínio para determinar a contagem de usuários ativos
5. **Ordenação de Resultados**: Retorna domínios ordenados por contagem de usuários ativos (maior primeiro)

**Tratamento de Erros**

* **400 Bad Request**: Retorna mensagens de erro detalhadas para parâmetros inválidos:
  * Formato de player\_id inválido
  * Minutos fora do intervalo válido (1-720)
* **401 Unauthorized**: Mantém os requisitos de autenticação existentes

**Casos de Uso**

Este endpoint permite que você:

* **Monitoramento em tempo real**: Rastreie engajamento atual do usuário em diferentes domínios
* **Análise de tráfego**: Entenda quais domínios estão gerando mais usuários ativos
* **Otimização de performance**: Identifique domínios de alto tráfego para alocação de recursos
* **Insights de marketing**: Monitore eficácia de campanhas em tempo real
* **Decisões operacionais**: Tome decisões imediatas baseadas na atividade atual do usuário
* **Sistemas de alerta**: Construa sistemas de monitoramento para padrões de tráfego incomuns

***

### Versão 1.3.0 (2025-07-18)

#### Novas Funcionalidades

* **Aprimorado endpoint `/players/list` com filtro por data**: Adicionados parâmetros opcionais de consulta para melhores capacidades de filtragem de players:
  * **Filtro por intervalo de datas**: Adicionados parâmetros `start_date` e `end_date` para filtrar players por data de criação
  * **Suporte a fuso horário**: Adicionado parâmetro `timezone` para filtragem precisa de datas em diferentes fusos horários
  * **Validação de parâmetros**: Adicionada validação abrangente para parâmetros de data para garantir formato datetime adequado
  * **Compatibilidade com versões anteriores**: Todos os novos parâmetros são opcionais, garantindo que integrações existentes continuem funcionando sem alterações

**Características Principais**

O endpoint `/players/list` aprimorado agora suporta:

* **Filtro por data**: Filtre players criados dentro de um intervalo específico de datas usando os parâmetros `start_date` e `end_date`
* **Consciência de fuso horário**: Especifique fuso horário para cálculos precisos de data (padrão UTC se não fornecido)

**Exemplo de Uso**

```bash
# Requisição básica (inalterada)
GET /players/list

# Filtrar players criados nos últimos 30 dias
GET /players/list?start_date=2023-10-01&end_date=2023-10-31

# Filtrar com especificação de fuso horário
GET /players/list?start_date=2023-10-01 00:00:00&end_date=2023-10-31 23:59:59&timezone=America/Sao_Paulo

# Filtrar players criados após uma data específica
GET /players/list?start_date=2023-10-01&timezone=America/Sao_Paulo
```

**Detalhes dos Parâmetros**

* **`start_date`** (opcional): Data de início do período para filtro de players. Usa comparação >=. Suporta formatos como "2023-10-26T18:24:05.000+00:00" ou "2023-10-26 18:24:05 UTC"
* **`end_date`** (opcional): Data final do período para filtro de players. Usa comparação <=. Mesmos formatos de data que start\_date
* **`timezone`** (opcional): Fuso horário a ser usado para filtro de data. Padrão 'Etc/UCT' se não especificado

**Formato de Resposta**

O formato de resposta permanece inalterado, garantindo compatibilidade com versões anteriores:

```json
[
  {
    "id": "player1",
    "name": "Meu Player",
    "pitch_time": 0,
    "duration": 3600,
    "created_at": "2025-07-18T10:00:00Z"
  }
]
```

**Casos de Uso**

Esta melhoria permite que você:

* **Análises baseadas em tempo**: Filtre players criados dentro de campanhas específicas ou períodos de tempo
* **Relatórios**: Gere relatórios para players criados durante períodos comerciais específicos
* **Auditoria**: Acompanhe padrões de criação de players ao longo do tempo
* **Gerenciamento de dados**: Consulte eficientemente players baseados em timestamps de criação

***

### Versão 1.2.0 (2025-06-27)

#### Novas Funcionalidades

* **Novo endpoint `/sessions/stats_by_day`**: Adicionado analytics diário abrangente de sessões que fornece estatísticas detalhadas divididas por dia dentro de um intervalo de datas especificado.

**Características Principais**

O endpoint `/sessions/stats_by_day` fornece:

* **Métricas diárias de sessão**: Total de visualizações, inicializações, finalizações e cliques agregados por dia
* **Rastreamento de usuário único**: Contagens separadas para sessões únicas e dispositivos únicos em todas as métricas
* **Análise de engajamento**: Cálculos de taxa de engajamento baseados no tempo médio de visualização
* **Análise de limite de pitch**: Rastreia usuários que assistiram acima/abaixo do limite de tempo de pitch
* **Rastreamento de conversão**: Contagens diárias de conversão com valores em múltiplas moedas (USD, BRL, EUR)
* **Cálculo de taxa de reprodução**: Percentual de visualizadores que começaram a reproduzir após visualizar
* **Filtro por intervalo de datas**: Filtro flexível de datas com suporte a fuso horário

**Exemplo de Requisição**

```json
{
  "player_id": "65fb3c74ab21c70007b3e0dd",
  "start_date": "2023-01-01",
  "end_date": "2023-01-31",
  "timezone": "America/Sao_Paulo",
  "video_duration": 3600,
  "pitch_time": 30
}
```

**Exemplo de Resposta**

```json
[
  {
    "date_key": "2023-01-01",
    "total_viewed": 200,
    "total_viewed_device_uniq": 180,
    "total_viewed_session_uniq": 190,
    "total_started": 250,
    "total_started_session_uniq": 230,
    "total_started_device_uniq": 220,
    "total_finished": 150,
    "total_finished_session_uniq": 140,
    "total_finished_device_uniq": 130,
    "engagement_rate": 75.56,
    "total_clicked": 50,
    "total_clicked_device_uniq": 45,
    "total_clicked_session_uniq": 40,
    "total_over_pitch": 30,
    "total_under_pitch": 10,
    "over_pitch_rate": 75.0,
    "total_conversions": 10,
    "overall_conversion_rate": 2.56,
    "total_amount_usd": 1000,
    "total_amount_brl": 1000,
    "total_amount_eur": 1000,
    "play_rate": 2.56
  },
  {
    "date_key": "2023-01-02",
    "total_viewed": 180,
    "total_viewed_device_uniq": 160,
    "total_viewed_session_uniq": 170,
    "total_started": 220,
    "total_started_session_uniq": 210,
    "total_started_device_uniq": 200,
    "total_finished": 130,
    "total_finished_session_uniq": 120,
    "total_finished_device_uniq": 110,
    "engagement_rate": 72.3,
    "total_clicked": 40,
    "total_clicked_device_uniq": 35,
    "total_clicked_session_uniq": 30,
    "total_over_pitch": 25,
    "total_under_pitch": 8,
    "over_pitch_rate": 75.76,
    "total_conversions": 8,
    "overall_conversion_rate": 2.27,
    "total_amount_usd": 800,
    "total_amount_brl": 800,
    "total_amount_eur": 800,
    "play_rate": 2.27
  }
]
```

**Entendendo as Métricas Diárias**

O endpoint `/sessions/stats_by_day` fornece detalhamentos diários detalhados de:

* **Métricas de Sessão**: Visualização abrangente, contagens de início, fim e cliques para cada dia
* **Rastreamento Único**: Contagens únicas separadas por sessão e dispositivo para entender o comportamento do usuário
* **Análise de Engajamento**: Taxas de engajamento diárias mostrando quanto do vídeo os usuários estão assistindo
* **Performance de Pitch**: Análise diária de quantos usuários assistem além do seu limite de pitch
* **Rastreamento de Conversão**: Dados completos de conversão com valores monetários em múltiplas moedas
* **Análise de Tendências**: Comparação dia-a-dia para identificar padrões e tendências

**Casos de Uso**

Este endpoint permite que você:

* **Acompanhe tendências de performance diárias**: Monitore como o engajamento varia dia a dia
* **Identifique dias de pico de performance**: Encontre quais dias geram mais engajamento e conversões
* **Analise padrões sazonais**: Entenda como o comportamento do usuário muda ao longo do tempo
* **Rastreamento de performance de campanhas**: Meça o impacto diário de campanhas de marketing
* **Otimização de conteúdo**: Identifique quais dias têm taxas de engajamento mais altas para planejamento de conteúdo
* **Análise de conversão**: Acompanhe padrões diários de conversão e tendências de receita
* **Insights de comportamento do usuário**: Entenda padrões de visualização em diferentes dias da semana ou mês

***

### Versão 1.1.0 (2025-06-25)

#### Novas Funcionalidades

* Aprimorado o endpoint `/custom_metrics/list` com melhorias significativas:
  * **Novo método POST**: Adicionado endpoint POST em `/custom_metrics/list` para melhor manipulação de parâmetros
  * **Cálculo de taxa de engajamento**: Agora calcula e retorna taxas de engajamento para cada métrica personalizada
  * **Filtro por intervalo de datas**: Adicionados parâmetros opcionais `start_date` e `end_date` para filtrar métricas por período
  * **Suporte a fuso horário**: Adicionado parâmetro de timezone para filtragem precisa de datas em diferentes fusos horários
  * **Análises de usuário aprimoradas**: Retorna `total_users`, `users_above` e `engagement_rate` para cada métrica personalizada

**Caminho de Migração**

O endpoint GET original `/custom_metrics/{player_id}/list` está agora **obsoleto** e será removido em **25 de julho de 2025**. Por favor, migre para o novo endpoint POST.

**Exemplo de Requisição (Novo Método POST)**

```json
{
  "player_id": "64a5c8072e6fd10009828db2",
  "start_date": "2023-01-01 00:00:00",
  "end_date": "2023-12-31 23:59:59",
  "timezone": "America/Sao_Paulo"
}
```

**Exemplo de Resposta (Aprimorada com Dados de Engajamento)**

```json
[
  {
    "id": "685acdfa39be67017b9be72d",
    "name": "Métrica Personalizada 1",
    "time": 600,
    "sequential_number": 1,
    "engagement_rate": 18.18,
    "total_users": 55,
    "users_above": 10
  },
  {
    "id": "685acdfa39be67017b9be72e",
    "name": "Métrica Personalizada 2",
    "time": 1200,
    "sequential_number": 2,
    "engagement_rate": 12.73,
    "total_users": 55,
    "users_above": 7
  }
]
```

**Entendendo as Novas Métricas**

O endpoint aprimorado agora fornece análises detalhadas de engajamento:

* **`engagement_rate`**: Percentual de usuários que assistiram além do timestamp da métrica personalizada
* **`total_users`**: Número total de usuários que assistiram ao vídeo no período especificado
* **`users_above`**: Número de usuários que assistiram além do timestamp desta métrica personalizada
* **Filtro por data**: Quando `start_date` e `end_date` são fornecidos, as análises são calculadas apenas para sessões dentro desse período
* **Consciência de fuso horário**: As datas são adequadamente tratadas de acordo com o fuso horário especificado

**Casos de Uso**

Esta melhoria permite que você:

* **Analise retenção ao longo do tempo**: Compare taxas de engajamento para as mesmas métricas personalizadas em diferentes períodos
* **Rastreie padrões sazonais**: Use filtro por data para entender como o engajamento do usuário varia por temporada ou períodos de campanha
* **Calcule taxas de retenção precisas**: Obtenha percentuais exatos de usuários atingindo cada marco personalizado
* **Gere relatórios baseados em tempo**: Crie relatórios periódicos mostrando tendências de engajamento em momentos-chave do vídeo
* **Teste A/B**: Compare taxas de engajamento para diferentes versões de vídeo ou campanhas de marketing

#### Mudanças Incompatíveis

* **Aviso de Obsolescência**: O endpoint GET `/custom_metrics/{player_id}/list` está obsoleto e será removido em 25 de julho de 2025
* **Migração Necessária**: Aplicações usando o endpoint GET devem migrar para o novo endpoint POST até a data de obsolescência

***

### Versão 1.0.9 (2025-06-24)

#### Novas Funcionalidades

* Adicionado novo endpoint `/sessions/stats` que fornece estatísticas abrangentes de sessão para um player específico:
  * Retorna métricas detalhadas de sessão incluindo total de visualizações, inicializações, finalizações e cliques
  * Fornece contagens únicas por sessão e dispositivo para cada tipo de métrica
  * Calcula taxas de engajamento e métricas de conversão
  * Inclui análise de tempo de pitch mostrando usuários que assistiram acima/abaixo do limite do pitch
  * Retorna dados de conversão com valores em múltiplas moedas (USD, BRL, EUR)
  * Suporte para filtro por intervalo de datas e configuração de fuso horário

**Exemplo de Requisição**

```json
{
  "player_id": "65fb3c74ab21c70007b3e0dd",
  "start_date": "2023-01-01",
  "end_date": "2024-01-31",
  "timezone": "America/Sao_Paulo",
  "video_duration": 3600,
  "pitch_time": 30
}
```

**Exemplo de Resposta**

```json
{
  "total_viewed": 200,
  "total_viewed_device_uniq": 180,
  "total_viewed_session_uniq": 190,
  "total_started": 250,
  "total_started_session_uniq": 230,
  "total_started_device_uniq": 220,
  "total_finished": 150,
  "total_finished_session_uniq": 140,
  "total_finished_device_uniq": 130,
  "engagement_rate": 75.56,
  "total_clicked": 50,
  "total_clicked_device_uniq": 45,
  "total_clicked_session_uniq": 40,
  "total_over_pitch": 30,
  "total_under_pitch": 10,
  "over_pitch_rate": 75,
  "total_conversions": 10,
  "overall_conversion_rate": 2.56,
  "total_amount_usd": 1000,
  "total_amount_brl": 1000,
  "total_amount_eur": 1000,
  "play_rate": 2.56
}
```

**Entendendo as Métricas**

O endpoint `/sessions/stats` fornece várias métricas importantes:

* **Métricas de Visualização**: Total de visualizações e visualizações únicas por sessão e dispositivo
* **Métricas de Engajamento**: Taxas de início/fim e percentuais gerais de engajamento
* **Análise de Pitch**: Mostra quantos usuários assistiram além do limite de tempo de pitch configurado
* **Dados de Conversão**: Métricas completas de conversão com valores monetários em múltiplas moedas
* **Taxa de Reprodução**: Percentual de visualizadores que começaram a reproduzir o vídeo após visualizar

Este endpoint é particularmente útil para:

* Obter uma visão abrangente do desempenho do player
* Analisar padrões de engajamento do usuário
* Entender a eficácia das conversões
* Rastrear retenção no limite do pitch
* Comparar desempenho entre diferentes períodos de tempo

***

### Version 1.0.8 (2025-06-17)

#### Melhorias

* Corrigido um problema onde às vezes durante a busca da listagem de players (`/players/list`) alguns valores poderiam vir duplicados

***

### Versão 1.0.7 (05/06/2025)

#### Melhorias

* Aprimorado o endpoint `/players/list` com informações adicionais do player:
  * Adicionado campo `pitch_time` para mostrar a configuração de tempo de pitch do player
  * Adicionado campo `duration` para exibir a duração do vídeo associado
  * Mantém compatibilidade com implementações existentes

**Exemplo de Resposta**

```json
[
  {
    "id": "player1",
    "name": "Meu Player",
    "pitch_time": 0,
    "duration": 3600,
    "created_at": "2025-06-05T10:00:00Z"
  }
]
```

***

### Versão 1.0.6 (2025-05-30)

#### Novas Funcionalidades

* Adicionado novo endpoint `/custom_metrics/{player_id}/list` que fornece uma lista de todas as métricas personalizadas de um player específico:
  * Retorna informações da métrica personalizada incluindo ID, nome, tempo e número sequencial
  * Permite rastrear pontos específicos de tempo do vídeo para análise de retenção
  * Possibilita o cálculo de percentuais de engajamento dos usuários em timestamps específicos do vídeo

**Exemplo de Resposta**

```json
[
  {
    "id": "metric1",
    "name": "Primeiro Ponto Chave",
    "time": 30,
    "sequential_number": 1
  },
  {
    "id": "metric2",
    "name": "Segundo Ponto Chave",
    "time": 60,
    "sequential_number": 2
  }
]
```

**Entendendo Métricas Personalizadas e Engajamento do Usuário**

O endpoint de métricas personalizadas trabalha em conjunto com o endpoint `/times/user_engagement` para ajudar no cálculo das taxas de retenção em timestamps específicos do vídeo. Veja como usá-los juntos:

1. Primeiro, liste suas métricas personalizadas para timestamps importantes do vídeo usando o endpoint `/custom_metrics/{player_id}/list`
2. Em seguida, use o endpoint `/times/user_engagement` para obter o número de usuários em cada timestamp fornecendo:
   * `player_id`: O ID do seu player
   * `video_duration`: Duração total do vídeo em segundos
   * `start_date` e `end_date`: O período que você deseja analisar
   * `timezone`: Seu fuso horário preferido para filtragem de datas

Exemplo de requisição para `/times/user_engagement`:

```json
{
  "start_date": "2023-10-26 18:24:05",
  "end_date": "2023-11-26 18:24:05",
  "player_id": "65fb3c74ab21c70007b3e0dd",
  "video_duration": 3600,
  "timezone": "America/Sao_Paulo"
}
```

3. O endpoint de engajamento do usuário retornará dados mostrando quantos usuários atingiram cada segundo do vídeo
4. Você pode então calcular a retenção comparando o número de usuários em cada timestamp de métrica personalizada com o número total de usuários

Por exemplo, se você tem:

* Total de usuários: 100
* Usuários em 30 segundos (Primeiro Ponto Chave): 80
* Usuários em 60 segundos (Segundo Ponto Chave): 50

As taxas de retenção seriam:

* Primeiro Ponto Chave: 80% (80/100)
* Segundo Ponto Chave: 50% (50/100)

Esta combinação permite que você:

* Acompanhe o engajamento dos usuários em pontos específicos e significativos do seu vídeo
* Calcule taxas de retenção para marcos personalizados
* Analise quantos usuários estão atingindo seus momentos-chave do vídeo
* Tome decisões baseadas em dados sobre o conteúdo e duração do vídeo

***

### Versão 1.0.5 (28/05/2025)

#### Novas Funcionalidades

* Adicionado novo endpoint `/players/list` que fornece uma lista de todos os players pertencentes à empresa do usuário autenticado:
  * Retorna informações básicas do player incluindo ID, nome e data de criação
  * Filtra automaticamente os players com base na empresa do usuário autenticado
  * Suporta formato de resposta JSON

**Exemplo de Resposta**

```json
[
  {
    "id": "player1",
    "name": "Meu Player",
    "created_at": "2025-05-28T10:00:00Z"
  }
]
```

***

### Versão 1.0.4 (27/05/2025)

#### Novas Funcionalidades

* Adicionado novo endpoint `/events/leaderboard` que fornece rankings de players baseados em métricas de engajamento de vídeo:
  * Suporta múltiplos rankings com diferentes limites de players em uma única requisição
  * Permite filtrar por tipos de eventos (started, finished, viewed, clicked, paused)
  * Inclui métricas para total de reproduções, reproduções únicas por sessão e reproduções únicas por dispositivo
  * Suporta filtro por período com data final opcional

**Exemplo de Requisição**

```json
{
  "company_id": "2b884cba-0b12-42ce-b3a1-7a3182d414df",
  "leaderboards": [
    {
      "leaderboard_limit": 10,
      "start_date": "2023-10-26",
      "end_date": "2023-11-26",
      "event": "finished"
    },
    {
      "leaderboard_limit": 5,
      "start_date": "2023-09-26",
      "event": "started"
    }
  ],
  "timezone": "America/Sao_Paulo"
}
```

**Exemplo de Resposta**

```json
[
  {
    "leaderboard_name": "leaderboard_10",
    "event": "finished",
    "leaderboards": [
      {
        "player_id": "player1",
        "total_plays": 100,
        "uniq_plays": 50,
        "uniq_device_plays": 25
      }
    ]
  }
]
```

***

### Version 1.0.3 (2025-05-15)

#### Melhorias

* Melhorada a performance dos seguintes endopints:
  * `/events/total_by_company_day`

**Detalhamento**

Algumas vezes durante a requisição de alguns usuários, os mesmos estavam atingindo o limite de recurso permitido, porém, o request\
em questão não requisitava muitos dias de dados, isso foi um problema causado devido a maneira com a qual o endpoint agregava dados,\
todos os requests devem ser normalizados agora utilizando uma quantidade devida de recursos.

***

### Versão 1.0.2 (2025-05-15)

#### Melhorias

* Melhorias para lidar com exceções em requests que utilizam mais recursos do que o permitido considerando o plano da empresa:
  * Adicionado controles específicos para lidar com o erro `AUTHENTICATION_FAILED`
  * Adicionado controles específicos para lidar com o erro `MEMORY_LIMIT_EXCEEDED`

**Exemplos de respostas de erro 401 - Não autorizado**

Quando uma empresa não tem acesso ainda a API:

```json
{
  "error": "This company does not have access to the public analytics API.",
  "code": 516
}
```

Quando a query ultrapassa o limite de recurso autorizado para o plano da empresa:

```json
{
  "error": "Your api key tier is not enough to perform this query. Please contact support at contato@vturb.com.br",
  "code": 241
}
```

***

### Versão 1.0.1 (15/05/2025)

#### Correções de Bugs

* Corrigido o tratamento de fuso horário no endpoint `/sessions/stats_by_field_by_day` para garantir relatórios de data consistentes em diferentes fusos horários. Isso afeta como as datas são calculadas nas seguintes métricas:
  * Estatísticas de sessão por dia
  * Taxas de conversão
  * Timestamps de eventos
  * Agregações baseadas em data

**Exemplo da Correção**

Antes desta correção, ao usar o fuso horário "America/Sao\_Paulo" (GMT-3), eventos que ocorreram no mesmo dia poderiam ser divididos em duas datas diferentes devido a problemas de conversão de fuso horário. Por exemplo:

```json
// Antes da correção
{
    "grouped_field": "United States",
    "total_viewed": 100,
    "date_key": "2025-05-13"  // Alguns eventos de 14 de maio foram incorretamente agrupados aqui
},
{
    "grouped_field": "United States",
    "total_viewed": 200,
    "date_key": "2025-05-14"  // Apenas alguns eventos de 14 de maio estavam aqui
}
```

Agora, todos os eventos do mesmo dia são agrupados corretamente, independentemente do fuso horário especificado na requisição:

```json
// Após a correção
{
  "grouped_field": "United States",
  "total_viewed": 300, // Todos os eventos de 14 de maio agora estão corretamente agrupados
  "date_key": "2025-05-14"
}
```

***

*Nota: Esta versão inclui correções e melhorias na funcionalidade existente sem introduzir novos recursos ou alterações incompatíveis.*
