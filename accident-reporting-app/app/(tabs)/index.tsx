import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useMonitoring } from '@/hooks/useMonitoring';
import { AccidentAlertModal } from '@/components/AccidentAlertModal';
import { MapPin, Power, CircleAlert as AlertCircle, Navigation } from 'lucide-react-native';
import { alertService } from '@/services/alert.service';

export default function HomeScreen() {
  const { profile } = useAuth();
  const {
    isMonitoring,
    currentLocation,
    settings,
    showAccidentAlert,
    startMonitoring,
    stopMonitoring,
    sendEmergencyAlert,
    cancelAlert,
  } = useMonitoring();

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    alertService.retryQueuedAlerts();
  }, []);

  const handleStartMonitoring = async () => {
    const success = await startMonitoring();
    if (!success) {
      Alert.alert(
        'Error',
        'Could not start monitoring. Please check your permissions.'
      );
    }
  };

  const handleStopMonitoring = () => {
    Alert.alert(
      'Stop Monitoring',
      'Are you sure you want to stop accident monitoring?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: stopMonitoring,
        },
      ]
    );
  };

  const handleManualReport = async () => {
    Alert.alert(
      'Report Accident',
      'Are you sure you want to send an emergency alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            setIsSending(true);
            const success = await sendEmergencyAlert(true);
            setIsSending(false);
            if (success) {
              Alert.alert('Success', 'Emergency alert has been sent!');
            } else {
              Alert.alert(
                'Queued',
                'Alert saved and will be sent when connection is restored.'
              );
            }
          },
        },
      ]
    );
  };

  const handleAlertSend = async () => {
    setIsSending(true);
    await sendEmergencyAlert(false);
    setIsSending(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {profile?.full_name}</Text>
          <View
            style={[
              styles.statusBadge,
              isMonitoring ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isMonitoring ? styles.statusTextActive : styles.statusTextInactive,
              ]}
            >
              {isMonitoring ? 'Monitoring Active' : 'Safe Mode'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={24} color="#3B82F6" />
            <Text style={styles.cardTitle}>Current Location</Text>
          </View>
          {currentLocation ? (
            <View style={styles.locationInfo}>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Latitude:</Text>
                <Text style={styles.locationValue}>
                  {currentLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>Longitude:</Text>
                <Text style={styles.locationValue}>
                  {currentLocation.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noLocationText}>
              Location not available
            </Text>
          )}
        </View>

        {settings && (
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Detection:</Text>
              <Text style={styles.settingValue}>
                {settings.detection_enabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sensitivity:</Text>
              <Text style={styles.settingValue}>
                Level {settings.sensitivity_level}
              </Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>SMS Fallback:</Text>
              <Text style={styles.settingValue}>
                {settings.sms_fallback_enabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {!isMonitoring ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartMonitoring}
            >
              <Power size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Monitoring</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopMonitoring}
            >
              <Power size={24} color="#FFFFFF" />
              <Text style={styles.stopButtonText}>Stop Monitoring</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleManualReport}
            disabled={isSending || !currentLocation}
          >
            <AlertCircle size={24} color="#FFFFFF" />
            <Text style={styles.reportButtonText}>
              {isSending ? 'Sending...' : 'Report Accident'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AccidentAlertModal
        visible={showAccidentAlert}
        timeout={settings?.auto_send_timeout || 10}
        onSendHelp={handleAlertSend}
        onCancel={cancelAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusInactive: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#16A34A',
  },
  statusTextInactive: {
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  locationInfo: {
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  noLocationText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  startButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
