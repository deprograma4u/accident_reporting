import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { alertService } from '@/services/alert.service';
import { AccidentReport } from '@/types/database.types';
import { Clock, MapPin, ExternalLink, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState<AccidentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (!user) return;

    setLoading(true);
    const history = await alertService.getAccidentHistory(user.id);
    setReports(history);
    setLoading(false);
  };

  const openInMaps = (latitude: number, longitude: number) => {
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={20} color="#10B981" />;
      case 'failed':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <AlertCircle size={20} color="#F59E0B" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return '#DCFCE7';
      case 'failed':
        return '#FEE2E2';
      default:
        return '#FEF3C7';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'sent':
        return '#16A34A';
      case 'failed':
        return '#DC2626';
      default:
        return '#D97706';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderReport = ({ item }: { item: AccidentReport }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.detectionType}>
            {item.detection_type === 'auto' ? 'Auto Detected' : 'Manual Report'}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          {getStatusIcon(item.status)}
          <Text
            style={[
              styles.statusText,
              { color: getStatusTextColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.reportContent}>
        <View style={styles.infoRow}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.infoText}>{formatDate(item.timestamp)}</Text>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={16} color="#6B7280" />
          <View style={styles.locationInfo}>
            <Text style={styles.coordinates}>
              {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => openInMaps(item.latitude, item.longitude)}
            style={styles.mapButton}
          >
            <ExternalLink size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {item.accelerometer_data && (
          <View style={styles.sensorData}>
            <Text style={styles.sensorLabel}>Impact Magnitude:</Text>
            <Text style={styles.sensorValue}>
              {item.accelerometer_data.magnitude.toFixed(2)} m/s²
            </Text>
          </View>
        )}

        {item.error_message && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{item.error_message}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accident History</Text>
        <Text style={styles.subtitle}>All reported accidents and alerts</Text>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No accident reports yet</Text>
            <Text style={styles.emptySubtext}>
              Your accident history will appear here
            </Text>
          </View>
        }
        refreshing={loading}
        onRefresh={loadHistory}
      />
    </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  typeContainer: {
    flex: 1,
  },
  detectionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportContent: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInfo: {
    flex: 1,
  },
  coordinates: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  mapButton: {
    padding: 4,
  },
  sensorData: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sensorLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  sensorValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
