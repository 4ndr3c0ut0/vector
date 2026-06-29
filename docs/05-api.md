# API REST

## Base

```text
/api/v1
```

Todas as respostas usam JSON.

## GET /health

Verifica se o backend esta ativo.

### Resposta

```json
{
  "status": "ok",
  "service": "vector-api",
  "version": "0.1.0"
}
```

## POST /api/v1/runs

Registra uma tentativa de fase.

### Request

```json
{
  "playerId": "b3217b87-7340-42ec-84bb-2f7d91d2a010",
  "levelId": "level-001",
  "levelVersion": "0.1.0",
  "score": 2450,
  "durationMs": 132400,
  "rescuedSurvivors": 1,
  "totalSurvivors": 1,
  "energyRemaining": 34,
  "result": "victory",
  "deathCause": null,
  "clientVersion": "0.1.0"
}
```

### Resposta

```json
{
  "id": "bf7f0629-0f89-4b28-a3fb-05c8c7f10ed1",
  "accepted": true,
  "rankPosition": 18,
  "createdAt": "2026-06-28T12:00:00Z"
}
```

## GET /api/v1/leaderboard

Lista ranking.

### Query Params

- `levelId`: fase.
- `limit`: quantidade de resultados, padrao 50.
- `period`: `all`, `daily`, `weekly`, `monthly`.

### Exemplo

```text
GET /api/v1/leaderboard?levelId=level-001&limit=10&period=weekly
```

### Resposta

```json
{
  "levelId": "level-001",
  "period": "weekly",
  "entries": [
    {
      "position": 1,
      "playerId": "b3217b87-7340-42ec-84bb-2f7d91d2a010",
      "displayName": "VECTOR-742",
      "score": 3200,
      "durationMs": 98400,
      "createdAt": "2026-06-28T12:00:00Z"
    }
  ]
}
```

## POST /api/v1/players

Cria jogador anonimo ou identificado.

### Request anonimo

```json
{
  "displayName": "VECTOR-742",
  "anonymous": true
}
```

### Request identificado futuro

```json
{
  "displayName": "Ana",
  "anonymous": false,
  "email": "ana@example.com"
}
```

### Resposta

```json
{
  "id": "b3217b87-7340-42ec-84bb-2f7d91d2a010",
  "displayName": "VECTOR-742",
  "anonymous": true,
  "createdAt": "2026-06-28T12:00:00Z"
}
```

## GET /api/v1/players/:id/progress

Busca progresso do jogador.

### Resposta

```json
{
  "playerId": "b3217b87-7340-42ec-84bb-2f7d91d2a010",
  "unlockedLevels": ["level-001"],
  "upgrades": {
    "energyTank": 1,
    "thrusterEfficiency": 0,
    "scannerRange": 0
  },
  "bestRuns": [
    {
      "levelId": "level-001",
      "score": 3200,
      "durationMs": 98400,
      "rescuedSurvivors": 1
    }
  ],
  "achievements": ["first_rescue"]
}
```

## PUT /api/v1/players/:id/progress

Atualiza progresso do jogador.

### Request

```json
{
  "unlockedLevels": ["level-001", "level-002"],
  "upgrades": {
    "energyTank": 2,
    "thrusterEfficiency": 1,
    "scannerRange": 1
  },
  "achievements": ["first_rescue", "fast_extract"]
}
```

### Resposta

```json
{
  "playerId": "b3217b87-7340-42ec-84bb-2f7d91d2a010",
  "updated": true,
  "updatedAt": "2026-06-28T12:00:00Z"
}
```

## Codigos de Erro

```json
{
  "error": {
    "code": "invalid_request",
    "message": "score must be greater than or equal to zero"
  }
}
```
