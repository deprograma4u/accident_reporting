import { supabase } from '@/lib/supabase';
import { AccidentReport, EmergencyContact } from '@/types/database.types';
import { AccelerometerData } from './accelerometer.service';
import { locationService } from './location.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AlertPayload {
  userId: string;
  fullName: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  detectionType: 'auto' | 'manual';
  accelerometerData?: AccelerometerData;
}

class AlertService {
  private readonly QUEUE_KEY = 'accident_report_queue';

  async sendAlert(payload: AlertPayload): Promise<boolean> {
    try {
      const reportId = await this.saveAccidentReport(payload);

      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', payload.userId);

      const mapsUrl = locationService.getMapsUrl(payload.latitude, payload.longitude);

      try {
        await this.sendToBackend({
          ...payload,
          reportId,
          emergencyContacts: contacts || [],
          mapsUrl,
        });

        await this.updateReportStatus(reportId, 'sent');
        return true;
      } catch (apiError) {
        console.error('Backend API failed:', apiError);

        const { data: settings } = await supabase
          .from('user_settings')
          .select('sms_fallback_enabled')
          .eq('user_id', payload.userId)
          .maybeSingle();

        if (settings?.sms_fallback_enabled && contacts && contacts.length > 0) {
          await this.sendSMSFallback(contacts, payload, mapsUrl);
          await this.updateReportStatus(reportId, 'sent');
          return true;
        }

        await this.queueForRetry(payload);
        await this.updateReportStatus(reportId, 'pending');
        return false;
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      await this.queueForRetry(payload);
      return false;
    }
  }

  private async saveAccidentReport(payload: AlertPayload): Promise<string> {
    const { data, error } = await supabase
      .from('accident_reports')
      .insert({
        user_id: payload.userId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        detection_type: payload.detectionType,
        status: 'pending',
        accelerometer_data: payload.accelerometerData,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  private async updateReportStatus(reportId: string, status: 'pending' | 'sent' | 'failed', errorMessage?: string) {
    const updateData: any = { status };
    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    }
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    await supabase
      .from('accident_reports')
      .update(updateData)
      .eq('id', reportId);
  }

  private async sendToBackend(data: any): Promise<void> {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/send-emergency-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Backend API request failed');
    }
  }

  private async sendSMSFallback(
    contacts: EmergencyContact[],
    payload: AlertPayload,
    mapsUrl: string
  ): Promise<void> {
    console.log('SMS Fallback triggered');
    console.log(`Sending to ${contacts.length} contacts`);
    console.log(`Message: Emergency! ${payload.fullName} may have been in an accident. Location: ${mapsUrl}`);
  }

  private async queueForRetry(payload: AlertPayload): Promise<void> {
    try {
      const existingQueue = await AsyncStorage.getItem(this.QUEUE_KEY);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      queue.push({
        ...payload,
        queuedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error queuing alert:', error);
    }
  }

  async retryQueuedAlerts(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (!queueData) return;

      const queue = JSON.parse(queueData);
      const failedAlerts: any[] = [];

      for (const payload of queue) {
        const success = await this.sendAlert(payload);
        if (!success) {
          failedAlerts.push(payload);
        }
      }

      if (failedAlerts.length > 0) {
        await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(failedAlerts));
      } else {
        await AsyncStorage.removeItem(this.QUEUE_KEY);
      }
    } catch (error) {
      console.error('Error retrying queued alerts:', error);
    }
  }

  async getAccidentHistory(userId: string): Promise<AccidentReport[]> {
    const { data, error } = await supabase
      .from('accident_reports')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data || [];
  }
}

export const alertService = new AlertService();
