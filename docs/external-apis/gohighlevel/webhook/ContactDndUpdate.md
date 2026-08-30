---
title: "Contact"
source: "https://marketplace.gohighlevel.com/docs/webhook/ContactDndUpdate"
seccion: "Webhook > ContactDndUpdate"
api_version: "v3"
capturado: "2026-08-30"
---

# Contact

Called whenever a contact's dnd field is updated

#### Schema

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "locationId": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "address1": {
      "type": "string"
    },
    "city": {
      "type": "string"
    },
    "companyName": {
      "type": "string"
    },
    "country": {
      "type": "string"
    },
    "source": {
      "type": "string"
    },
    "dateAdded": {
      "type": "string"
    },
    "dateOfBirth": {
      "type": "string"
    },
    "dnd": {
      "type": "boolean"
    },
    "dndSettings": {
      "type": "object",
      "properties": {
        "SMS": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "code": {
              "type": "string"
            }
          }
        },
        "Email": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "code": {
              "type": "string"
            }
          }
        },
        "GMB": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "code": {
              "type": "string"
            }
          }
        },
        "FB": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "code": {
              "type": "string"
            }
          }
        },
        "WhatsApp": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "code": {
              "type": "string"
            }
          }
        },
        "Call": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "code": {
              "type": "string"
            }
          }
        }
      }
    },
    "inboundDndSettings": {
      "type": "object",
      "properties": {
        "all": {
          "type": "object",
          "properties": {
            "status": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          }
        }
      }
    },
    "email": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    },
    "phone": {
      "type": "string"
    },
    "phoneLabel": {
      "type": "string"
    },
    "postalCode": {
      "type": "string"
    },
    "state": {
      "type": "string"
    },
    "tags": {
      "type": "array"
    },
    "website": {
      "type": "string"
    },
    "assignedTo": {
      "type": "string"
    },
    "customFields": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "value": {
            "type": ["string", "number", "array", "object"]
          }
        }
      }
    }
  }
}
```

#### Example

```json
{
  "type": "ContactDndUpdate",
  "locationId": "ve9EPM428h8vShlRW1KT",
  "id": "nmFmQEsNgz6AVpgLVUJ0",
  "address1": "3535 1st St N",
  "city": "ruDolomitebika",
  "state": "AL",
  "companyName": "Loram ipsum",
  "country": "DE",
  "source": "xyz form",
  "dateAdded": "2021-11-26T12:41:02.193Z",
  "dateOfBirth": "2000-01-05T00:00:00.000Z",
  "dnd": true,
  "dndSettings": {
    "SMS": {
      "status": "inactive",
      "message": "Some message",
      "code": "101"
    },
    "Call": {
      "status": "inactive",
      "message": "Some message",
      "code": "101"
    },
    "Email": {
      "status": "active",
      "message": "Some message",
      "code": "101"
    },
    "GMB": {
      "status": "active",
      "message": "Some message",
      "code": "101"
    },
    "FB": {
      "status": "active",
      "message": "Some message",
      "code": "101"
    },
    "WhatsApp": {
      "status": "active",
      "message": "Some message",
      "code": "101"
    }
  },
  "inboundDndSettings": {
    "all": {
      "status": "active",
      "message": "Some message"
    }
  },
  "email": "[email protected]",
  "name": "John Deo",
  "firstName": "John",
  "lastName": "Deo",
  "phone": "+919509597501",
  "phoneLabel": "Mobile",
  "postalCode": "452001",
  "tags": ["id magna sed Lorem", "Duis dolor commodo aliqua"],
  "website": "https://www.google.com/",
  "assignedTo": "nmFmQEsNgz6AVpgLVUJ0",
  "customFields": [
    {
      "id": "BcdmQEsNgz6AVpgLVUJ0",
      "value": "XYZ Corp"
    }
  ]
}
```
