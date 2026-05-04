import { Accelerometer } from 'expo-sensors';
import { Subscription } from 'expo-sensors/build/Pedometer';

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

type AccidentCallback = (data: AccelerometerData) => void;

class AccelerometerService {
  private subscription: Subscription | null = null;
  private isMonitoring = false;
  private sensitivityThresholds = {
    1: 25,
    2: 20,
    3: 15,
    4: 12,
    5: 10,
  };

  async checkAvailability(): Promise<boolean> {
    return await Accelerometer.isAvailableAsync();
  }

  startMonitoring(sensitivityLevel: number, onAccident: AccidentCallback) {
    if (this.isMonitoring) {
      return;
    }

    const threshold = this.sensitivityThresholds[sensitivityLevel as keyof typeof this.sensitivityThresholds] || 15;

    Accelerometer.setUpdateInterval(100);

    this.subscription = Accelerometer.addListener((accelerometerData) => {
      const { x, y, z } = accelerometerData;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > threshold) {
        const data: AccelerometerData = {
          x,
          y,
          z,
          magnitude,
        };
        onAccident(data);
      }
    });

    this.isMonitoring = true;
  }

  stopMonitoring() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isMonitoring = false;
  }

  getMonitoringStatus(): boolean {
    return this.isMonitoring;
  }
}

export const accelerometerService = new AccelerometerService();
