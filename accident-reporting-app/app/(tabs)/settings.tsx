import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserSettings } from '@/types/database.types';
import { Settings as SettingsIcon, LogOut, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    setSettings(data);
    setLoading(false);
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!user || !settings) return;

    const { error } = await supabase
      .from('user_settings')
      .update({ [key]: value })
      .eq('user_id', user.id);

    if (error) {
      Alert.alert('Error', 'Failed to update setting');
    } else {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading || !settings) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileIcon}>
          <User size={40} color="#3B82F6" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.full_name}</Text>
          <Text style={styles.profilePhone}>{profile?.phone_number}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detection Settings</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Enable Detection</Text>
            <Text style={styles.settingDescription}>
              Automatically detect accidents using sensors
            </Text>
          </View>
          <Switch
            value={settings.detection_enabled}
            onValueChange={(value) => updateSetting('detection_enabled', value)}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={settings.detection_enabled ? '#3B82F6' : '#F3F4F6'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>SMS Fallback</Text>
            <Text style={styles.settingDescription}>
              Send SMS if internet is unavailable
            </Text>
          </View>
          <Switch
            value={settings.sms_fallback_enabled}
            onValueChange={(value) =>
              updateSetting('sms_fallback_enabled', value)
            }
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={settings.sms_fallback_enabled ? '#3B82F6' : '#F3F4F6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sensitivity Level</Text>
        <Text style={styles.sectionDescription}>
          Higher sensitivity = more responsive detection
        </Text>

        <View style={styles.sensitivityContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.sensitivityButton,
                settings.sensitivity_level === level &&
                  styles.sensitivityButtonActive,
              ]}
              onPress={() => updateSetting('sensitivity_level', level)}
            >
              <Text
                style={[
                  styles.sensitivityText,
                  settings.sensitivity_level === level &&
                    styles.sensitivityTextActive,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auto-Send Timeout</Text>
        <Text style={styles.sectionDescription}>
          Seconds before auto-sending emergency alert
        </Text>

        <View style={styles.timeoutContainer}>
          {[5, 10, 15, 20, 30].map((seconds) => (
            <TouchableOpacity
              key={seconds}
              style={[
                styles.timeoutButton,
                settings.auto_send_timeout === seconds &&
                  styles.timeoutButtonActive,
              ]}
              onPress={() => updateSetting('auto_send_timeout', seconds)}
            >
              <Text
                style={[
                  styles.timeoutText,
                  settings.auto_send_timeout === seconds &&
                    styles.timeoutTextActive,
                ]}
              >
                {seconds}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Accident Alert System v1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  sensitivityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sensitivityButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sensitivityButtonActive: {
    backgroundColor: '#3B82F6',
  },
  sensitivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  sensitivityTextActive: {
    color: '#FFFFFF',
  },
  timeoutContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  timeoutButtonActive: {
    backgroundColor: '#3B82F6',
  },
  timeoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeoutTextActive: {
    color: '#FFFFFF',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
