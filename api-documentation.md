# 🌐 MediSafe REST API Documentation

**HackInMotion 2026 — Team RICR-HIM-1114**  
**Theme:** Healthcare &amp; HealthTech  
**Project:** MediSafe — Smart Medicine Safety &amp; Drug Interaction Assistant  

---

## 📑 Table of Contents
1. [Overview](#overview)
2. [Base URL &amp; Authentication](#base-url--authentication)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Medicine Safety &amp; Interaction Scanner Endpoints](#medicine-safety--interaction-scanner-endpoints)
5. [Health Analytics &amp; Vitals Endpoints](#health-analytics--vitals-endpoints)
6. [Emergency Hospital Radar Endpoints](#emergency-hospital-radar-endpoints)
7. [Error Handling &amp; Security Standards](#error-handling--security-standards)

---

## 1. Overview
The MediSafe backend REST API provides secure patient authentication, real-time FDA active compound drug-drug interaction scanning, mobile Fast2SMS OTP verification, dosage adherence tracking, and geospatial emergency hospital lookup via OpenStreetMap Overpass integration.

---

## 2. Base URL &amp; Authentication

- **Development Base URL:** `http://localhost:5000/api`
- **Production Base URL:** `https://medisafe-api.onrender.com/api`

### Headers:
```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

---

## 3. Authentication Endpoints

### 3.1 Send Mobile SMS OTP
Triggers a 6-digit Fast2SMS OTP delivery to the patient's registered mobile number.

- **Endpoint:** `POST /auth/send-otp`
- **Auth Required:** No

#### Request Body:
```json
{
  "mobileNumber": "9876543210"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "message": "OTP sent successfully via Fast2SMS gateway.",
  "requestId": "req_84920412"
}
```

---

### 3.2 Verify Mobile OTP &amp; Login
Verifies the 6-digit OTP and returns a signed JWT authentication token.

- **Endpoint:** `POST /auth/verify-otp`
- **Auth Required:** No

#### Request Body:
```json
{
  "mobileNumber": "9876543210",
  "otp": "482910"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1092ab841029",
    "phone": "9876543210",
    "name": "Sittu Dev",
    "verified": true
  }
}
```

---

## 4. Medicine Safety &amp; Interaction Scanner Endpoints

### 4.1 Search Medicines Directory (With Misspelling Handling)
Searches prescription &amp; OTC medicines with fuzzy matching for misspelled queries (e.g., `paracetal` -> `Paracetamol`).

- **Endpoint:** `GET /medicines/search?q={query}`
- **Auth Required:** No

#### Query Parameters:
- `q` (string, required): Medicine brand or active compound name.

#### Response (200 OK):
```json
{
  "success": true,
  "query": "paracetal",
  "correctedQuery": "Paracetamol",
  "results": [
    {
      "id": "med_101",
      "name": "Dolo 650mg Tablet",
      "activeCompound": "Paracetamol (Acetaminophen)",
      "fdaClass": "Analgesic / Antipyretic",
      "dosageForm": "Tablet",
      "manufacturer": "Micro Labs Ltd",
      "commonUses": ["Fever", "Mild to Moderate Pain"]
    }
  ]
}
```

---

### 4.2 FDA Active Compound Interaction Scanner
Scans multiple active compounds for major, moderate, or minor clinical drug interactions.

- **Endpoint:** `POST /medicines/interaction-check`
- **Auth Required:** Optional

#### Request Body:
```json
{
  "compounds": ["Paracetamol", "Ibuprofen", "Warfarin"]
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "scanTimestamp": "2026-08-14T19:00:00.000Z",
  "riskLevel": "MAJOR_WARNING",
  "totalInteractions": 1,
  "interactions": [
    {
      "pair": ["Ibuprofen", "Warfarin"],
      "severity": "High / Major",
      "riskType": "Bleeding Risk Increase",
      "clinicalExplanation": "Concomitant use of NSAIDs (Ibuprofen) with anticoagulants (Warfarin) significantly increases gastrointestinal bleeding risk.",
      "medicalDisclaimer": "Always consult a licensed physician or pharmacist before altering your prescription medication regime."
    }
  ]
}
```

---

## 5. Health Analytics &amp; Vitals Endpoints

### 5.1 Get Patient Health Overview
- **Endpoint:** `GET /health/vitals`
- **Auth Required:** Yes (Bearer Token)

#### Response (200 OK):
```json
{
  "success": true,
  "vitals": {
    "activeMedicinesCount": 4,
    "drugInteractionRiskLevel": "SAFE",
    "adherenceRatePercentage": 96.5,
    "scansCompletedThisWeek": 18
  }
}
```

---

## 6. Emergency Hospital Radar Endpoints

### 6.1 Geospatial OpenStreetMap Hospital Lookup
- **Endpoint:** `GET /health/hospitals-radar?lat={latitude}&amp;lng={longitude}`
- **Auth Required:** No

#### Response (200 OK):
```json
{
  "success": true,
  "userLocation": { "lat": 28.5355, "lng": 77.2100 },
  "hospitalsCount": 4,
  "hospitals": [
    {
      "id": 101,
      "name": "Max Super Speciality Hospital",
      "address": "Press Enclave Road, Saket, New Delhi",
      "phone": "+91 11 2651 5050",
      "lat": 28.5276,
      "lng": 77.2131,
      "distanceKm": 1.2,
      "bedsFree": 14,
      "icuFree": 5
    }
  ]
}
```

---

## 7. Error Handling &amp; Security Standards

All error responses strictly follow standardized JSON format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The credentials provided are invalid or expired."
  }
}
```
