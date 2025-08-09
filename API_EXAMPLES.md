# NileTech API Examples

## Project Creation Endpoints

### 1. Create Project with Invoice

**Endpoint:** `POST /api/v1/projects/with-invoice`

**Description:** Creates a new project and automatically generates an invoice with all services and products included.

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Website Redesign for Acme Corp",
  "description": "Complete website redesign with modern UI/UX and responsive design",
  "clientName": "Acme Corporation",
  "clientEmail": "client@acme.com",
  "clientPhone": "+1234567890",
  "clientId": 3,
  "budgetId": 1,
  "assignedToId": 2,
  "status": "PENDING",
  "priority": "MEDIUM",
  "estimatedHours": 80,
  "timeEstimated": 4800,
  "timeSpent": 120,
  "actualHours": 2,
  "lastActivityAt": "2025-07-24T12:00:00.000Z",
  "progress": 25,
  "startedAt": "2025-07-14T10:00:00.000Z",
  "finishedAt": "2025-08-01T18:00:00.000Z",
  "deadline": "2025-08-01T18:00:00.000Z",
  "notes": "Urgent project with high priority. Client needs responsive design.",
  "clientFeedback": "Great work on the initial design!",
  "internalNotes": "Technical challenges with API integration",
  "isPublic": true,
  "allowClientUpdates": false,
  "milestones": [
    {
      "title": "Design Phase Complete",
      "description": "Complete all design mockups and get client approval",
      "dueDate": "2025-08-01T18:00:00.000Z",
      "order": 1
    }
  ],
  "services": [
    {
      "serviceId": 1,
      "quantity": 2,
      "unitPrice": 150,
      "notes": "Premium service with extended warranty"
    }
  ],
  "products": [
    {
      "productId": 1,
      "quantity": 5,
      "unitPrice": 25,
      "notes": "High-quality materials"
    }
  ],
  "invoiceNotes": "Payment due within 30 days"
}
```

**cURL Example:**
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/projects/with-invoice' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic3VyYWZlbEBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1NDU2MTY0MywiZXhwIjoxNzU1MTY2NDQzfQ.9pFMWaGGU0R8z19Y3M69gjn1zwVf7Zdw3eeTitW4g10' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Website Redesign for Acme Corp",
  "description": "Complete website redesign with modern UI/UX and responsive design",
  "clientName": "Acme Corporation",
  "clientEmail": "client@acme.com",
  "clientPhone": "+1234567890",
  "clientId": 3,
  "budgetId": 1,
  "assignedToId": 2,
  "status": "PENDING",
  "priority": "MEDIUM",
  "estimatedHours": 80,
  "timeEstimated": 4800,
  "timeSpent": 120,
  "actualHours": 2,
  "lastActivityAt": "2025-07-24T12:00:00.000Z",
  "progress": 25,
  "startedAt": "2025-07-14T10:00:00.000Z",
  "finishedAt": "2025-08-01T18:00:00.000Z",
  "deadline": "2025-08-01T18:00:00.000Z",
  "notes": "Urgent project with high priority. Client needs responsive design.",
  "clientFeedback": "Great work on the initial design!",
  "internalNotes": "Technical challenges with API integration",
  "isPublic": true,
  "allowClientUpdates": false,
  "milestones": [
    {
      "title": "Design Phase Complete",
      "description": "Complete all design mockups and get client approval",
      "dueDate": "2025-08-01T18:00:00.000Z",
      "order": 1
    }
  ],
  "services": [
    {
      "serviceId": 1,
      "quantity": 2,
      "unitPrice": 150,
      "notes": "Premium service with extended warranty"
    }
  ],
  "products": [
    {
      "productId": 1,
      "quantity": 5,
      "unitPrice": 25,
      "notes": "High-quality materials"
    }
  ],
  "invoiceNotes": "Payment due within 30 days"
}'
```

### 2. Create Project with Both Invoice and Proforma

**Endpoint:** `POST /api/v1/projects/with-both`

**Description:** Creates a new project and automatically generates both an invoice and a proforma invoice with all services and products included.

**Request Body:**
```json
{
  "title": "Website Redesign for Acme Corp",
  "description": "Complete website redesign with modern UI/UX and responsive design",
  "clientName": "Acme Corporation",
  "clientEmail": "client@acme.com",
  "clientPhone": "+1234567890",
  "clientId": 3,
  "budgetId": 1,
  "assignedToId": 2,
  "status": "PENDING",
  "priority": "MEDIUM",
  "estimatedHours": 80,
  "timeEstimated": 4800,
  "timeSpent": 120,
  "actualHours": 2,
  "lastActivityAt": "2025-07-24T12:00:00.000Z",
  "progress": 25,
  "startedAt": "2025-07-14T10:00:00.000Z",
  "finishedAt": "2025-08-01T18:00:00.000Z",
  "deadline": "2025-08-01T18:00:00.000Z",
  "notes": "Urgent project with high priority. Client needs responsive design.",
  "clientFeedback": "Great work on the initial design!",
  "internalNotes": "Technical challenges with API integration",
  "isPublic": true,
  "allowClientUpdates": false,
  "milestones": [
    {
      "title": "Design Phase Complete",
      "description": "Complete all design mockups and get client approval",
      "dueDate": "2025-08-01T18:00:00.000Z",
      "order": 1
    }
  ],
  "services": [
    {
      "serviceId": 1,
      "quantity": 2,
      "unitPrice": 150,
      "notes": "Premium service with extended warranty"
    }
  ],
  "products": [
    {
      "productId": 1,
      "quantity": 5,
      "unitPrice": 25,
      "notes": "High-quality materials"
    }
  ],
  "invoiceNotes": "Payment due within 30 days",
  "proformaNotes": "Terms and conditions, delivery timeline"
}
```

**cURL Example:**
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/projects/with-both' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic3VyYWZlbEBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1NDU2MTY0MywiZXhwIjoxNzU1MTY2NDQzfQ.9pFMWaGGU0R8z19Y3M69gjn1zwVf7Zdw3eeTitW4g10' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Website Redesign for Acme Corp",
  "description": "Complete website redesign with modern UI/UX and responsive design",
  "clientName": "Acme Corporation",
  "clientEmail": "client@acme.com",
  "clientPhone": "+1234567890",
  "clientId": 3,
  "budgetId": 1,
  "assignedToId": 2,
  "status": "PENDING",
  "priority": "MEDIUM",
  "estimatedHours": 80,
  "timeEstimated": 4800,
  "timeSpent": 120,
  "actualHours": 2,
  "lastActivityAt": "2025-07-24T12:00:00.000Z",
  "progress": 25,
  "startedAt": "2025-07-14T10:00:00.000Z",
  "finishedAt": "2025-08-01T18:00:00.000Z",
  "deadline": "2025-08-01T18:00:00.000Z",
  "notes": "Urgent project with high priority. Client needs responsive design.",
  "clientFeedback": "Great work on the initial design!",
  "internalNotes": "Technical challenges with API integration",
  "isPublic": true,
  "allowClientUpdates": false,
  "milestones": [
    {
      "title": "Design Phase Complete",
      "description": "Complete all design mockups and get client approval",
      "dueDate": "2025-08-01T18:00:00.000Z",
      "order": 1
    }
  ],
  "services": [
    {
      "serviceId": 1,
      "quantity": 2,
      "unitPrice": 150,
      "notes": "Premium service with extended warranty"
    }
  ],
  "products": [
    {
      "productId": 1,
      "quantity": 5,
      "unitPrice": 25,
      "notes": "High-quality materials"
    }
  ],
  "invoiceNotes": "Payment due within 30 days",
  "proformaNotes": "Terms and conditions, delivery timeline"
}'
```

### 3. Create Project without Invoice

**Endpoint:** `POST /api/v1/projects/without-invoice`

**Description:** Creates a new project without automatically generating an invoice. Services and products can be added later.

**Request Body:**
```json
{
  "title": "Website Redesign for Acme Corp",
  "description": "Complete website redesign with modern UI/UX and responsive design",
  "clientName": "Acme Corporation",
  "clientEmail": "client@acme.com",
  "clientPhone": "+1234567890",
  "clientId": 3,
  "budgetId": 1,
  "assignedToId": 2,
  "status": "PENDING",
  "priority": "MEDIUM",
  "estimatedHours": 80,
  "timeEstimated": 4800,
  "timeSpent": 120,
  "actualHours": 2,
  "lastActivityAt": "2025-07-24T12:00:00.000Z",
  "progress": 25,
  "startedAt": "2025-07-14T10:00:00.000Z",
  "finishedAt": "2025-08-01T18:00:00.000Z",
  "deadline": "2025-08-01T18:00:00.000Z",
  "notes": "Urgent project with high priority. Client needs responsive design.",
  "clientFeedback": "Great work on the initial design!",
  "internalNotes": "Technical challenges with API integration",
  "isPublic": true,
  "allowClientUpdates": false,
  "milestones": [
    {
      "title": "Design Phase Complete",
      "description": "Complete all design mockups and get client approval",
      "dueDate": "2025-08-01T18:00:00.000Z",
      "order": 1
    }
  ],
  "services": [
    {
      "serviceId": 1,
      "quantity": 2,
      "unitPrice": 150,
      "notes": "Premium service with extended warranty"
    }
  ],
  "products": [
    {
      "productId": 1,
      "quantity": 5,
      "unitPrice": 25,
      "notes": "High-quality materials"
    }
  ],
  "proformaNotes": "Terms and conditions, delivery timeline"
}
```

**cURL Example:**
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/projects/without-invoice' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic3VyYWZlbEBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1NDU2MTY0MywiZXhwIjoxNzU1MTY2NDQzfQ.9pFMWaGGU0R8z19Y3M69gjn1zwVf7Zdw3eeTitW4g10' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Website Redesign for Acme Corp",
  "description": "Complete website redesign with modern UI/UX and responsive design",
  "clientName": "Acme Corporation",
  "clientEmail": "client@acme.com",
  "clientPhone": "+1234567890",
  "clientId": 3,
  "budgetId": 1,
  "assignedToId": 2,
  "status": "PENDING",
  "priority": "MEDIUM",
  "estimatedHours": 80,
  "timeEstimated": 4800,
  "timeSpent": 120,
  "actualHours": 2,
  "lastActivityAt": "2025-07-24T12:00:00.000Z",
  "progress": 25,
  "startedAt": "2025-07-14T10:00:00.000Z",
  "finishedAt": "2025-08-01T18:00:00.000Z",
  "deadline": "2025-08-01T18:00:00.000Z",
  "notes": "Urgent project with high priority. Client needs responsive design.",
  "clientFeedback": "Great work on the initial design!",
  "internalNotes": "Technical challenges with API integration",
  "isPublic": true,
  "allowClientUpdates": false,
  "milestones": [
    {
      "title": "Design Phase Complete",
      "description": "Complete all design mockups and get client approval",
      "dueDate": "2025-08-01T18:00:00.000Z",
      "order": 1
    }
  ],
  "services": [
    {
      "serviceId": 1,
      "quantity": 2,
      "unitPrice": 150,
      "notes": "Premium service with extended warranty"
    }
  ],
  "products": [
    {
      "productId": 1,
      "quantity": 5,
      "unitPrice": 25,
      "notes": "High-quality materials"
    }
  ],
  "proformaNotes": "Terms and conditions, delivery timeline"
}'
```

## Important Notes

### Date Format
All dates must be in ISO 8601 format with milliseconds and timezone:
- ✅ Correct: `"2025-07-14T10:00:00.000Z"`
- ❌ Incorrect: `"2025-07-14T10:00:00Z"`

### Required Fields
- `title` (minimum 3 characters)
- `clientName` (if no `clientId` provided)

### Optional Fields
- All other fields are optional and can be omitted
- `services` and `products` arrays can be empty or omitted
- `milestones` array can be empty or omitted

### Response Format
- **with-invoice**: Returns project object with invoice details
- **with-both**: Returns object with project, invoice, and proforma details
- **without-invoice**: Returns project object only

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Minimal Working Example

Here's a minimal working example that you can use as a starting point:

```json
{
  "title": "Test Project",
  "description": "A simple test project",
  "clientName": "Test Client",
  "status": "PENDING",
  "priority": "MEDIUM"
}
```

This minimal payload will work for all three endpoints and only includes the required fields.
