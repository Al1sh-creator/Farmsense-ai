# FarmSense AI Engine — API Testing Guide

Base URL: `http://localhost:8000`

> All `/api/` routes require the internal key header:
> `X-Internal-Key: <your INTERNAL_API_KEY from .env>`

---

## 1. Weather — Get Current Weather

**GET** `/api/weather/current/`

**Headers:**
```
X-Internal-Key: <INTERNAL_API_KEY>
```

**Query Params:**
```
latitude=28.6139
longitude=77.2090
```

**Full URL Example:**
```
GET http://localhost:8000/api/weather/current/?latitude=28.6139&longitude=77.2090
```

**Expected Response:**
```json
{
  "success": true,
  "weather": { ... },
  "alerts": [ ... ]
}
```

---

## 2. Crop Recommendation

**POST** `/api/crops/recommend/`

**Headers:**
```
Content-Type: application/json
X-Internal-Key: <INTERNAL_API_KEY>
```

**Body:**
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.8,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.9
}
```

**Expected Response:**
```json
{
  "recommended_crop": "rice"
}
```

---

## 3. Fertilizer Recommendation

**POST** `/api/crops/fertilizer/`

**Headers:**
```
Content-Type: application/json
X-Internal-Key: <INTERNAL_API_KEY>
```

**Body:**
```json
{
  "Soil_Type": "Loamy",
  "Crop_Type": "Wheat",
  "Crop_Growth_Stage": "Vegetative",
  "Season": "Rabi",
  "Irrigation_Type": "Drip",
  "Previous_Crop": "Rice",
  "Region": "North",
  "Soil_pH": 6.8,
  "Soil_Moisture": 35.0,
  "Organic_Carbon": 1.2,
  "Electrical_Conductivity": 0.4,
  "Nitrogen_Level": 80.0,
  "Phosphorus_Level": 40.0,
  "Potassium_Level": 60.0,
  "Temperature": 22.0,
  "Humidity": 65.0,
  "Rainfall": 150.0,
  "Fertilizer_Used_Last_Season": 120.0,
  "Yield_Last_Season": 3500.0
}
```

**Expected Response:**
```json
{
  "recommended_fertilizer": "Urea"
}
```

---

## 4. Irrigation Prediction

**POST** `/api/crops/irrigation/`

**Headers:**
```
Content-Type: application/json
X-Internal-Key: <INTERNAL_API_KEY>
```

**Body:**
```json
{
  "Soil_Type": "Sandy",
  "Soil_pH": 6.5,
  "Soil_Moisture": 20.0,
  "Organic_Carbon": 0.8,
  "Electrical_Conductivity": 0.3,
  "Temperature_C": 30.0,
  "Humidity": 55.0,
  "Rainfall_mm": 10.0,
  "Sunlight_Hours": 8.0,
  "Wind_Speed_kmh": 15.0,
  "Crop_Type": "Maize",
  "Crop_Growth_Stage": "Flowering",
  "Season": "Kharif",
  "Irrigation_Type": "Sprinkler",
  "Water_Source": "Canal",
  "Field_Area_hectare": 2.5,
  "Mulching_Used": "Yes",
  "Previous_Irrigation_mm": 30.0,
  "Region": "South"
}
```

**Expected Response:**
```json
{
  "irrigation_need": "High"
}
```

---

## 5. Crop Yield Prediction

**POST** `/api/crops/yield/`

**Headers:**
```
Content-Type: application/json
X-Internal-Key: <INTERNAL_API_KEY>
```

**Body:**
```json
{
  "Crop": "Rice",
  "Crop_Year": 2024,
  "Season": "Kharif",
  "State": "Punjab",
  "Area": 500.0,
  "Annual_Rainfall": 1100.0,
  "Fertilizer": 200.0,
  "Pesticide": 50.0
}
```

**Expected Response:**
```json
{
  "predicted_yield": 3200.5
}
```

---

## 6. Generate Full Suggestion (All-in-One)

**POST** `/api/suggestions/`

> Runs all 4 models (crop, fertilizer, irrigation, yield) in one call.

**Headers:**
```
Content-Type: application/json
X-Internal-Key: <INTERNAL_API_KEY>
```

**Body:**
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.8,
  "humidity": 65.0,
  "ph": 6.5,
  "rainfall": 150.0,

  "Soil_Type": "Loamy",
  "Crop_Type": "Wheat",
  "Crop_Growth_Stage": "Vegetative",
  "Season": "Rabi",
  "Irrigation_Type": "Drip",
  "Previous_Crop": "Rice",
  "Region": "North",

  "Soil_pH": 6.8,
  "Soil_Moisture": 35.0,
  "Organic_Carbon": 1.2,
  "Electrical_Conductivity": 0.4,
  "Nitrogen_Level": 80.0,
  "Phosphorus_Level": 40.0,
  "Potassium_Level": 60.0,
  "Temperature": 22.0,
  "Humidity": 65.0,
  "Rainfall": 150.0,
  "Fertilizer_Used_Last_Season": 120.0,
  "Yield_Last_Season": 3500.0,

  "Temperature_C": 22.0,
  "Rainfall_mm": 150.0,
  "Sunlight_Hours": 7.0,
  "Wind_Speed_kmh": 12.0,
  "Water_Source": "Canal",
  "Field_Area_hectare": 2.5,
  "Mulching_Used": "Yes",
  "Previous_Irrigation_mm": 30.0,

  "Crop_Year": 2024,
  "State": "Punjab",
  "Area": 500.0,
  "Annual_Rainfall": 1100.0,
  "Fertilizer": 200.0,
  "Pesticide": 50.0
}
```

**Expected Response:**
```json
{
  "recommended_crop": "...",
  "recommended_fertilizer": "...",
  "irrigation_need": "...",
  "predicted_yield": ...
}
```

---

## Error Cases to Test

| Scenario | Expected Status |
|---|---|
| Missing `X-Internal-Key` header | `401 Unauthorized` |
| Wrong `X-Internal-Key` value | `401 Unauthorized` |
| Missing required body fields | `400 Bad Request` |
| Wrong field types (e.g. string for float) | `400 Bad Request` |
| Missing lat/lon on weather endpoint | `400 Bad Request` |

---

## Quick Test with curl

```bash
# Weather
curl "http://localhost:8000/api/weather/current/?latitude=28.6139&longitude=77.2090" \
  -H "X-Internal-Key: YOUR_KEY"

# Crop Recommendation
curl -X POST http://localhost:8000/api/crops/recommend/ \
  -H "Content-Type: application/json" \
  -H "X-Internal-Key: YOUR_KEY" \
  -d '{"N":90,"P":42,"K":43,"temperature":20.8,"humidity":82.0,"ph":6.5,"rainfall":202.9}'
```


---
---

# Node.js Server APIs (Base URL: `http://localhost:5000`)

> Auth: All protected routes need `Authorization: Bearer <JWT_TOKEN>` header.
> Routes marked with `[requireProfile]` also need the farm profile to be completed first.

---

## Auth APIs

### 7. Register

**POST** `/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Ravi Patel",
  "email": "ravi@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "token": "<JWT>",
  "user": { "id": 1, "name": "Ravi Patel", "email": "...", "profile_completed": false }
}
```

---

### 8. Login

**POST** `/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "ravi@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "id": 1, "name": "Ravi Patel", ... }
}
```

---

### 9. Get Current User

**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 10. Verify Email

**GET** `/api/auth/verify-email?token=<email_verify_token>`

No auth required. Token is received via email link.

---

### 11. Resend Verification Email

**POST** `/api/auth/resend-verification`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

No body required.

---

### 12. Logout

**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 13. Login History

**GET** `/api/auth/login-history`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Farm APIs

### 14. Setup Farm Profile (one-time onboarding)

**POST** `/api/farm/setup`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{
  "farm_name": "Ravi's Farm",
  "state": "Gujarat",
  "district": "Anand",
  "taluka": "Anand",
  "village": "Vallabh Vidyanagar",
  "pincode": "388120",
  "farm_area": 5.0,
  "area_unit": "acre",
  "soil_type": "black",
  "irrigation_type": "drip",
  "water_source": "canal",
  "current_crop": "cotton",
  "sow_date": "2026-06-15"
}
```

---

### 15. Get Farm Profile

**GET** `/api/farm/me` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 16. Update Farm Details

**PUT** `/api/farm/update` `[requireProfile]`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body (all fields optional — only include what you want to change):**
```json
{
  "farm_name": "Updated Farm Name",
  "current_crop": "wheat",
  "soil_type": "loamy"
}
```

---

### 17. Update Soil Profile (NPK + pH)

**PUT** `/api/farm/soil-profile` `[requireProfile]`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{
  "npk_nitrogen": 90.0,
  "npk_phosphorus": 42.0,
  "npk_potassium": 43.0,
  "ph_level": 6.5
}
```

---

### 18. Get Profile Completion Status

**GET** `/api/farm/profile-status`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 19. Update Coordinates Manually

**PUT** `/api/farm/coordinates` `[requireProfile]`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{
  "latitude": 22.5645,
  "longitude": 72.9289
}
```

---

## Fields APIs

### 20. Add Field to Farm

**POST** `/api/farm/:farmId/fields` `[requireProfile]`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{
  "field_name": "North Field",
  "field_size": 2.5,
  "current_crop": "cotton",
  "sow_date": "2026-06-15"
}
```

---

### 21. Get All Fields of a Farm

**GET** `/api/farm/:farmId/fields` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 22. Update a Field

**PUT** `/api/fields/update/:fieldId` `[requireProfile]`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body (all optional):**
```json
{
  "field_name": "Updated Field Name",
  "current_crop": "wheat",
  "sow_date": "2026-11-01"
}
```

---

### 23. Delete a Field

**DELETE** `/api/fields/delete/:fieldId` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Crops APIs

### 24. List Available Crops

**GET** `/api/crops/list`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Optional Query Param:**
```
?season=Kharif
```

---

### 25. Compare Crops (Profit Analysis)

**POST** `/api/crops/compare` `[requireProfile]`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{
  "crop_keys": ["cotton", "wheat", "rice"],
  "land_size": 5.0
}
```

Valid crop keys: `cotton`, `wheat`, `rice`, `maize`, `mungbean`, `chickpea`, `groundnut`, `soybean`, `bajra`, `mustard`

---

### 26. Crop Comparison History

**GET** `/api/crops/comparison-history` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Weather APIs (Server)

### 27. Get 16-Day Forecast

**GET** `/api/weather/forecast` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 28. Get Today's Weather

**GET** `/api/weather/today` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 29. Debug Farm Coordinates

**GET** `/api/weather/debug`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Suggestions APIs

### 30. Get Today's AI Suggestions

**GET** `/api/suggestions/` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Optional Query Params:**
```
?category=irrigation
?priority=high
?date=2026-08-03
```

---

### 31. Mark Suggestion as Read

**PUT** `/api/suggestions/:suggestionId/read` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 32. Suggestion History (last N days)

**GET** `/api/suggestions/history` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Optional Query Param:**
```
?days=7
```

---

## Alerts APIs

### 33. Get Active (Unread) Alerts

**GET** `/api/alerts/` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Optional Query Params:**
```
?severity=critical
?type=heavy_rain
?limit=20
```

---

### 34. Get Alert History

**GET** `/api/alerts/history` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Optional Query Params:**
```
?page=1&limit=20
```

---

### 35. Mark Single Alert as Read

**PUT** `/api/alerts/:alertId/read` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 36. Mark All Alerts as Read

**PUT** `/api/alerts/read-all` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Analysis APIs

### 37. Get Latest AI Analysis

**GET** `/api/analysis/latest` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 38. Run AI Analysis

**POST** `/api/analysis/run` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

No body required. Requires farm to have coordinates + soil profile (NPK + pH).

---

### 39. Analysis History

**GET** `/api/analysis/history` `[requireProfile]`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Optional Query Param:**
```
?limit=10
```

---

### 40. Check Django AI Engine Status

**GET** `/api/analysis/django-status`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 41. Trigger Daily Job (for testing)

**POST** `/api/analysis/trigger-job`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Notifications APIs

### 42. Get Notification Preferences

**GET** `/api/notifications/prefs`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 43. Update Notification Preferences

**PUT** `/api/notifications/prefs`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body (all optional):**
```json
{
  "email_alerts": true,
  "sms_alerts": false,
  "alert_time": "07:00",
  "alert_types": ["heavy_rain", "drought_risk", "heatwave", "fungal_risk"]
}
```

Valid alert_types: `heavy_rain`, `drought_risk`, `heatwave`, `frost_risk`, `strong_wind`, `fungal_risk`, `good_sowing_window`, `irrigation_needed`

---

### 44. Send Test Email

**POST** `/api/notifications/test-email`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Health Check

### 45. Server Health

**GET** `/health`

No headers or auth required.

**Expected Response:**
```json
{
  "status": "ok",
  "message": "FarmSense API is running",
  "timestamp": "2026-08-03T..."
}
```

---

## Typical Test Flow

1. `POST /api/auth/register` → get token
2. `POST /api/auth/login` → get token
3. `POST /api/farm/setup` → complete profile
4. `PUT /api/farm/soil-profile` → add NPK + pH
5. `GET /api/farm/profile-status` → verify `ai_ready: true`
6. `POST /api/analysis/run` → run AI analysis
7. `GET /api/analysis/latest` → view results
8. `GET /api/weather/forecast` → check weather + alerts
9. `GET /api/suggestions/` → view AI suggestions
  