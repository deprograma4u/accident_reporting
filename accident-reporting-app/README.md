# GPS-Enabled Accident Reporting and SMS Alert System

A production-ready React Native mobile application built with Expo that detects road accidents using sensor data, captures real-time GPS location, and sends emergency alerts.

## Features

### Core Functionality

- **Automatic Accident Detection**: Uses accelerometer sensors to detect sudden impacts
- **Real-time GPS Tracking**: Continuous location monitoring during active sessions
- **Emergency Alert System**: Automatic and manual emergency reporting
- **Smart Alert Confirmation**: 10-second countdown with manual override options
- **Offline Support**: Queue alerts when offline and retry when connection restored
- **SMS Fallback**: Backup notification system when internet is unavailable
- **Emergency Contacts**: Manage multiple emergency contacts with notifications
- **Accident History**: Complete log of all detected and reported accidents

### User Features

- Email/password authentication with Supabase
- Customizable detection sensitivity (5 levels)
- Adjustable auto-send timeout (5-30 seconds)
- Toggle detection and SMS fallback
- View accident reports with location links
- Profile management

## Technology Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Sensors**: expo-sensors (accelerometer)
- **Location**: expo-location (GPS)
- **Storage**: AsyncStorage (offline queue)
- **Backend**: Supabase Edge Functions
- **Icons**: Lucide React Native

## Project Structure

```
├── app/
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── contacts.tsx     # Emergency contacts
│   │   ├── settings.tsx     # User settings
│   │   ├── history.tsx      # Accident history
│   │   └── _layout.tsx      # Tab navigation
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Auth routing
├── components/              # Reusable UI components
│   ├── AccidentAlertModal.tsx
│   └── LoadingScreen.tsx
├── context/                 # Global state management
│   └── AuthContext.tsx
├── hooks/                   # Custom React hooks
│   └── useMonitoring.ts
├── services/                # Business logic
│   ├── accelerometer.service.ts
│   ├── location.service.ts
│   ├── alert.service.ts
│   └── background.service.ts
├── lib/                     # Configuration
│   └── supabase.ts
├── types/                   # TypeScript definitions
│   ├── database.types.ts
│   └── env.d.ts
└── supabase/                # Backend functions
    └── functions/
        └── send-emergency-alert/
```

## Installation

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Supabase account (database already configured)

### Setup Steps

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Configuration**

   The `.env` file is already configured with Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Database**

   Database schema is already deployed with:
   - User profiles and authentication
   - Emergency contacts management
   - Accident reports logging
   - User settings storage
   - Row Level Security enabled

4. **Backend Function**

   The emergency alert Edge Function is deployed and ready.

## Running the App

### Development

```bash
npm run dev
```

This will start the Expo development server. You can:
- Press `w` to open in web browser
- Scan QR code with Expo Go app (iOS/Android)
- Press `a` for Android emulator
- Press `i` for iOS simulator

### Type Checking

```bash
npm run typecheck
```

### Build for Web

```bash
npm run build:web
```

## Usage Guide

### Getting Started

1. **Registration**
   - Open the app and tap "Sign Up"
   - Enter full name, phone number, email, and password
   - Account is created with default settings

2. **Add Emergency Contacts**
   - Go to "Contacts" tab
   - Tap "Add Contact"
   - Enter contact name, phone number, and relationship
   - Add multiple contacts who will receive alerts

3. **Configure Settings**
   - Go to "Settings" tab
   - Adjust detection sensitivity (higher = more sensitive)
   - Set auto-send timeout (seconds before auto-alert)
   - Enable/disable SMS fallback
   - Toggle automatic detection on/off

4. **Start Monitoring**
   - Go to "Home" tab
   - Grant location and sensor permissions when prompted
   - Tap "Start Monitoring"
   - App begins monitoring for accidents

### How It Works

#### Automatic Detection

1. When monitoring is active, the app continuously:
   - Tracks GPS location
   - Monitors accelerometer for sudden impacts
   - Analyzes movement patterns

2. If sudden impact detected (based on sensitivity):
   - Full-screen alert appears
   - Countdown timer starts (default 10 seconds)
   - User can cancel or send immediately
   - If no response, alert sends automatically

3. Emergency alert includes:
   - User name and phone number
   - GPS coordinates
   - Google Maps link
   - Detection type (auto/manual)
   - Timestamp

#### Manual Reporting

- Tap "Report Accident" button anytime
- Confirmation dialog appears
- Alert sent immediately to all contacts

#### Offline Handling

- Alerts are queued locally if no internet
- Automatic retry when connection restored
- No data loss in offline scenarios

### Alert Flow

```
Impact Detected → Alert Modal (10s) → Auto-Send / Manual Action
                      ↓
              Emergency Contacts Notified
                      ↓
              Logged in Accident History
```

## Database Schema

### Tables

- **profiles**: User information (name, phone)
- **emergency_contacts**: Emergency contact list
- **accident_reports**: All accident reports and status
- **user_settings**: User preferences and configuration

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Authentication required for all operations

## API Endpoints

### Emergency Alert Function

**Endpoint**: `/functions/v1/send-emergency-alert`

**Method**: POST

**Payload**:
```json
{
  "userId": "uuid",
  "fullName": "string",
  "phoneNumber": "string",
  "latitude": number,
  "longitude": number,
  "detectionType": "auto" | "manual",
  "emergencyContacts": [...],
  "mapsUrl": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Emergency alert sent successfully",
  "contactsNotified": number
}
```

## Customization

### Sensitivity Levels

The app uses these impact thresholds (m/s²):

- **Level 1**: 25 (least sensitive)
- **Level 2**: 20
- **Level 3**: 15 (default)
- **Level 4**: 12
- **Level 5**: 10 (most sensitive)

Adjust in Settings based on your environment and vehicle type.

### Auto-Send Timeout

Configure countdown duration before auto-sending alerts:
- 5, 10, 15, 20, or 30 seconds
- Default: 10 seconds

## Platform Support

### Web (Default)
- Full UI functionality
- GPS location tracking
- Manual reporting
- Note: Accelerometer not available on web

### Android
- Full feature support
- Background monitoring capability
- Accelerometer detection
- SMS capabilities

### iOS
- Full feature support
- Background monitoring (with proper permissions)
- Accelerometer detection

## Permissions Required

- **Location** (Foreground): Required for GPS tracking
- **Location** (Background): Optional, for background monitoring
- **Sensors**: Optional, for automatic detection

## Troubleshooting

### Location Not Working
- Ensure location permissions granted
- Check device location services enabled
- Try stopping and restarting monitoring

### Detection Too Sensitive
- Lower sensitivity level in Settings
- Level 1-2 recommended for rough roads
- Level 4-5 for smooth highways

### Alerts Not Sending
- Check internet connection
- Verify emergency contacts added
- Check accident history for error messages
- Alerts are queued and retried automatically

### App Not Monitoring
- Ensure detection enabled in Settings
- Grant all required permissions
- Check battery optimization settings

## Development Notes

### Code Organization

- **Services**: Pure business logic, no UI dependencies
- **Hooks**: Reusable stateful logic
- **Components**: UI-only, minimal logic
- **Context**: Global state management

### Best Practices

- All services are singletons for efficiency
- Error handling at every layer
- Offline-first architecture
- Type-safe with TypeScript
- Clean separation of concerns

### Adding Features

1. Create service in `/services` for business logic
2. Create hook in `/hooks` for state management
3. Create component/screen in `/app` or `/components`
4. Update types in `/types` as needed

## Security Considerations

- Never expose Supabase service role key
- All database operations secured with RLS
- User data encrypted at rest
- Secure session management
- No sensitive data in logs

## Future Enhancements

Potential improvements:
- Real-time location sharing during emergency
- Voice calling emergency contacts
- Integration with emergency services (911)
- Crash severity estimation
- Family/friend live tracking
- Medical information storage
- Video/photo capture on impact

## Support

For issues or questions:
- Check troubleshooting section
- Review Expo documentation
- Check Supabase documentation

## License

Private application for safety and emergency use.

## Acknowledgments

Built with:
- Expo team for excellent React Native framework
- Supabase for backend infrastructure
- Lucide for beautiful icons
