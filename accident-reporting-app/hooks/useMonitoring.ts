import { useState, useEffect, useCallback } from 'react';
import { accelerometerService, AccelerometerData } from '@/services/accelerometer.service';
import { locationService } from '@/services/location.service';
import { alertService } from '@/services/alert.service';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserSettings, LocationData } from '@/types/database.types';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function useMonitoring() {
  const { user, profile } = useAuth();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showAccidentAlert, setShowAccidentAlert] = useState(false);
  const [accidentData, setAccidentData] = useState<AccelerometerData | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, []);

  const loadSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    setSettings(data);
  };

  const startMonitoring = async () => {
    if (!settings?.detection_enabled || !user || !profile) {
      return false;
    }

    const locationGranted = await locationService.requestPermissions();
    if (!locationGranted) {
      return false;
    }

    const accelerometerAvailable = await accelerometerService.checkAvailability();
    if (!accelerometerAvailable) {
      return false;
    }

    const location = await locationService.getCurrentLocation();
    if (!location) {
      return false;
    }

    setCurrentLocation(location);

    locationService.startWatching((loc) => {
      setCurrentLocation(loc);
    });

    accelerometerService.startMonitoring(
      settings.sensitivity_level,
      handleAccidentDetected
    );

    setIsMonitoring(true);
    return true;
  };

  const stopMonitoring = () => {
    locationService.stopWatching();
    accelerometerService.stopMonitoring();
    setIsMonitoring(false);
  };

  const handleAccidentDetected = useCallback((data: AccelerometerData) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setAccidentData(data);
    setShowAccidentAlert(true);
  }, []);

  const sendEmergencyAlert = async (manual: boolean = false) => {
    if (!user || !profile) return false;

    const location = currentLocation || (await locationService.getCurrentLocation());
    if (!location) return false;

    const success = await alertService.sendAlert({
      userId: user.id,
      fullName: profile.full_name,
      phoneNumber: profile.phone_number,
      latitude: location.latitude,
      longitude: location.longitude,
      detectionType: manual ? 'manual' : 'auto',
      accelerometerData: accidentData || undefined,
    });

    setShowAccidentAlert(false);
    setAccidentData(null);

    return success;
  };

  const cancelAlert = () => {
    setShowAccidentAlert(false);
    setAccidentData(null);
  };

  return {
    isMonitoring,
    currentLocation,
    settings,
    showAccidentAlert,
    startMonitoring,
    stopMonitoring,
    sendEmergencyAlert,
    cancelAlert,
    refreshSettings: loadSettings,
  };
}
