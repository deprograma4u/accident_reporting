export interface Profile {
  id: string;
  phone_number: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  contact_name: string;
  contact_phone: string;
  relationship?: string;
  created_at: string;
}

export interface AccidentReport {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  detection_type: 'auto' | 'manual';
  status: 'pending' | 'sent' | 'failed';
  accelerometer_data?: {
    x: number;
    y: number;
    z: number;
    magnitude: number;
  };
  timestamp: string;
  sent_at?: string;
  error_message?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  detection_enabled: boolean;
  sensitivity_level: number;
  sms_fallback_enabled: boolean;
  auto_send_timeout: number;
  updated_at: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}
