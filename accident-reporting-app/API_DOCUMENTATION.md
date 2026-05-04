# API Documentation

## Emergency Alert Backend API

### Overview

The backend API is implemented as a Supabase Edge Function that handles emergency alert notifications. The function receives accident reports and notifies all emergency contacts.

### Endpoint

```
POST /functions/v1/send-emergency-alert
```

### Authentication

No JWT verification required (verify_jwt: false) to allow public access for emergency situations.

### Request Headers

```
Content-Type: application/json
```

### Request Body

```typescript
{
  userId: string;              // User's unique ID
  fullName: string;            // User's full name
  phoneNumber: string;         // User's phone number
  latitude: number;            // Accident latitude
  longitude: number;           // Accident longitude
  detectionType: 'auto' | 'manual';  // How accident was detected
  emergencyContacts: Array<{
    contact_name: string;
    contact_phone: string;
  }>;
  mapsUrl: string;             // Google Maps link to location
}
```

### Response - Success (200)

```json
{
  "success": true,
  "message": "Emergency alert sent successfully",
  "contactsNotified": 3
}
```

### Response - Error (500)

```json
{
  "success": false,
  "error": "Error message details"
}
```

### Example Request

```javascript
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/send-emergency-alert',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: 'abc123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      latitude: 37.7749,
      longitude: -122.4194,
      detectionType: 'auto',
      emergencyContacts: [
        {
          contact_name: 'Jane Doe',
          contact_phone: '+1234567891'
        }
      ],
      mapsUrl: 'https://maps.google.com/?q=37.7749,-122.4194'
    })
  }
);

const data = await response.json();
console.log(data);
```

### Current Implementation

The current Edge Function logs alert details to the console and returns a success response. In production, this function would:

1. Send SMS messages to all emergency contacts
2. Send push notifications
3. Make voice calls if configured
4. Log to external monitoring systems
5. Notify emergency services if enabled

### Integration Points

The Edge Function can be extended to integrate with:

- **Twilio**: SMS and voice calling
- **SendGrid**: Email notifications
- **Firebase Cloud Messaging**: Push notifications
- **Emergency Services APIs**: Direct 911 integration
- **Webhook Endpoints**: Custom notification systems

### Rate Limiting

Consider implementing rate limiting to prevent:
- Duplicate alerts within short timeframes
- Alert spam from malfunctioning devices
- Abuse of the emergency system

### Monitoring

Log all alert attempts with:
- Timestamp
- User ID
- Location
- Success/failure status
- Error messages
- Contacts notified

### Security Considerations

- Validate all input data
- Sanitize phone numbers
- Verify user exists in database
- Log suspicious activity
- Implement abuse detection
- Rate limit per user/IP

### Error Handling

The function handles errors gracefully:
- Network failures: Returns 500 status
- Invalid data: Logs error and returns failure
- Missing contacts: Still logs accident report
- Partial failures: Reports partial success

### Testing

Test the function using:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-emergency-alert \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "fullName": "Test User",
    "phoneNumber": "+1234567890",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "detectionType": "manual",
    "emergencyContacts": [
      {
        "contact_name": "Emergency Contact",
        "contact_phone": "+1234567891"
      }
    ],
    "mapsUrl": "https://maps.google.com/?q=37.7749,-122.4194"
  }'
```

### Future Enhancements

1. **SMS Integration**
   - Integrate Twilio for actual SMS sending
   - Template customization
   - Delivery confirmation

2. **Voice Calls**
   - Automated voice calls to contacts
   - Text-to-speech for alert details
   - Call recording for evidence

3. **Push Notifications**
   - Real-time push to contacts' devices
   - Rich notifications with map preview
   - Action buttons (call back, view location)

4. **Emergency Services**
   - Direct integration with 911 systems
   - Automatic location sharing
   - Medical information transmission

5. **Analytics**
   - Alert response times
   - Contact notification success rates
   - Geographic accident patterns
   - False positive tracking
