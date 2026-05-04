import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface AccidentAlertModalProps {
  visible: boolean;
  timeout?: number;
  onSendHelp: () => void;
  onCancel: () => void;
}

export function AccidentAlertModal({
  visible,
  timeout = 10,
  onSendHelp,
  onCancel,
}: AccidentAlertModalProps) {
  const [countdown, setCountdown] = useState(timeout);

  useEffect(() => {
    if (visible) {
      setCountdown(timeout);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onSendHelp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visible, timeout]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={80} color="#EF4444" strokeWidth={2} />
          </View>

          <Text style={styles.title}>Possible Accident Detected!</Text>
          <Text style={styles.message}>Are you okay?</Text>

          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>{countdown}</Text>
            <Text style={styles.countdownLabel}>seconds</Text>
          </View>

          <Text style={styles.autoSendText}>
            Emergency alert will be sent automatically
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>I'm OK - Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.helpButton]}
              onPress={onSendHelp}
            >
              <Text style={styles.helpButtonText}>Send Help Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  countdownContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 100,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#EF4444',
  },
  countdownLabel: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: -5,
  },
  autoSendText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  helpButton: {
    backgroundColor: '#EF4444',
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
