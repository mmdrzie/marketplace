# API Documentation

## Base URL
```
http://localhost:4000/api/v1
```

## Response Format
All endpoints return:
```json
{ "success": true, "data": T }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

## Auth Endpoints
See PLAN.md for full endpoint catalog.

## Error Codes
See PLAN.md → Error Taxonomy section for all 16 error codes with HTTP mappings.
