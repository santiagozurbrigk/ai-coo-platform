---
title: "Autenticação da API"
source: "https://vturb.gitbook.io/analytics-api/pt/autenticacao-da-api"
idioma: "pt"
capturado: "2026-08-30"
---

# Autenticação da API

Nossa API utiliza dois cabeçalhos HTTP para se autenticar, sendo eles um para validar a autenticação e outro para escolher a versão da api a ser utilizada. Os dois cabeçalhos precisam estar incluídos em todas as requisições para garantir o sucesso da mesma.

### Cabeçalhos Obrigatórios

| Cabeçalho       | Descrição                                                               | Obrigatoriedade |
| --------------- | ----------------------------------------------------------------------- | --------------- |
| `X-Api-Token`   | O seu Token único de autenticação                                       | Sim             |
| `X-Api-Version` | A versão da API a qual você deseja se conectar (atualmente apenas `v1`) | Sim             |

### Obtendo o seu token de API

1. Acesse o seu painel
2. Navegue até a seção de configuração de API keys
3. Copie o seu token único de API
4. Mantenha esse token seguro e nunca compartilhe ele publicamente

### Realizando Requisições Autenticadas

#### Exemplo de Requisição

```bash
curl -X POST 'https://analytics.vturb.net/conversions/active_platforms' \
  -H 'X-Api-Token: YOUR_API_TOKEN' \
  -H 'X-Api-Version: v1' \
  -H 'Content-Type: application/json' \
  -d '{
    "start_date": "2023-10-26 18:24:05",
    "timezone": "America/Sao_Paulo"
  }'
```

#### Utilizando diferentes linguagens de programação

**Python**

```python
import requests

url = "https://analytics.vturb.net/conversions/active_platforms"
headers = {
    "X-Api-Token": "YOUR_API_TOKEN",
    "X-Api-Version": "v1",
    "Content-Type": "application/json"
}
payload = {
    "start_date": "2023-10-26 18:24:05",
    "timezone": "America/Sao_Paulo"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

**JavaScript**

```javascript
const url = 'https://analytics.vturb.net/conversions/active_platforms';
const headers = {
  'X-Api-Token': 'YOUR_API_TOKEN',
  'X-Api-Version': 'v1',
  'Content-Type': 'application/json'
};
const payload = {
  start_date: '2023-10-26 18:24:05',
  timezone: 'America/Sao_Paulo'
};

fetch(url, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(payload)
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**Ruby**

```ruby
require 'net/http'
require 'json'
require 'uri'

uri = URI('https://analytics.vturb.net/conversions/active_platforms')
headers = {
  'X-Api-Token' => 'YOUR_API_TOKEN',
  'X-Api-Version' => 'v1',
  'Content-Type' => 'application/json'
}
payload = {
  start_date: '2023-10-26 18:24:05',
  timezone: 'America/Sao_Paulo'
}

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
request = Net::HTTP::Post.new(uri.path, headers)
request.body = payload.to_json

response = http.request(request)
puts JSON.parse(response.body)
```

### Erros Comuns de Autenticação

#### 401 Não Autorizado

Esse erro ocorre quando:

* O cabeçalho `X-Api-Token` é inválido ou nulo
* O cabeçalho `X-Api-Version` é inválido ou nulo

Exemplo de mensagem de erro:

```json
{
  "error": "Unauthorized",
  "message": "Missing proper X-Api-Token or X-Api-Version"
}
```

#### Boas práticas

1. **Mantenha seu Token seguro**
   * Nunca compartilhe o seu token de API publicamente
   * Nunca versione no seu repositório o seu token
   * Use sempre variáveis de ambiente para acessar o seu token
   * Faça uma rotação do seu token pelo nosso painel caso o mesmo tenha sido comprometido
2. **Versão de API**
   * Sempre especifique no cabeçalho HTTP a versão da API a ser chamada utilizando `X-Api-Version`
   * Versões atualmente suportadas:
     * `v1`: Versão estável
3. **Lidando com erros**
   * Implemente mecanismos contra falhas na autenticação
   * Inclua uma lógica de X tentativas para lidar com possíveis inconsistências na abertura da requisição HTTP
   * Adicione logs na sua aplicação e em caso de necessidade compartilhe-os conosco para ajudarmos a buscar o problema

### Limites de Requisição

Para proteger nossa API contra abusos, implementamos limites de requisição. Se você exceder este limite irá receber uma resposta `429 Too Many Requests`. Contate o nosso suporte caso você precise aumentar o seu limite.

### Suporte

Se você está enfrentando errors ao se conectar e/ou utilizar a nossa API, por favor entre em contato com o nosso suporte em <https://help.vturb.com/pt-br/>.
