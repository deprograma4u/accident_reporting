import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { accelerometerService } from './accelerometer.service';

const LOCATION_TASK_NAME = 'background-location-task';

export class BackgroundService {
  static async registerBackgroundTask() {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Background location permission not granted');
        return false;
      }

      const isTaskDefined = TaskManager.isTaskDefined(LOCATION_TASK_NAME);
      if (!isTaskDefined) {
        await TaskManager.defineTask(
          LOCATION_TASK_NAME,
          async ({ data, error }: any) => {
            if (error) {
              console.error('Background task error:', error);
              return;
            }
            if (data) {
              const { locations } = data;
              console.log('Background location update:', locations);
            }
          }
        );
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000,
        distanceInterval: 50,
        foregroundService: {
          notificationTitle: 'Accident Monitoring Active',
          notificationBody: 'Your safety is being monitored',
        },
      });

      return true;
    } catch (error) {
      console.error('Error registering background task:', error);
      return false;
    }
  }

  static async stopBackgroundTask() {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch (error) {
      console.error('Error stopping background task:', error);
    }
  }

  static async isBackgroundTaskRunning(): Promise<boolean> {
    try {
      return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch {
      return false;
    }
  }
}
