/**
 * Health Service - Google Fit & Apple Health integration via Capacitor
 * 
 * NOTE: Native health plugins only work on device. This service uses
 * Capacitor.isNativePlatform() and dynamic plugin registration to avoid
 * build errors in web mode. The actual native plugins (@nicepayments/*)
 * must be installed in the native project after `npx cap add ios/android`.
 */

import { Capacitor } from "@capacitor/core";

export interface HealthData {
  steps: number;
  calories: number;
  distance: number; // meters
  workoutMinutes: number;
  lastSync: string | null;
}

const DEFAULT_DATA: HealthData = {
  steps: 0,
  calories: 0,
  distance: 0,
  workoutMinutes: 0,
  lastSync: null,
};

/**
 * Dynamically load a Capacitor plugin by name.
 * Returns null if the plugin is not available (e.g. web mode).
 */
async function loadNativePlugin(pluginName: string): Promise<any> {
  try {
    // Capacitor registers native plugins on `Capacitor.Plugins`
    const plugins = (Capacitor as any).Plugins;
    if (plugins && plugins[pluginName]) {
      return plugins[pluginName];
    }
    return null;
  } catch {
    return null;
  }
}

class HealthService {
  private isNative = Capacitor.isNativePlatform();
  private connected = false;

  isAvailable(): boolean {
    return this.isNative;
  }

  getPlatform(): "ios" | "android" | "web" {
    if (!this.isNative) return "web";
    return Capacitor.getPlatform() as "ios" | "android";
  }

  async requestAuthorization(): Promise<boolean> {
    if (!this.isNative) return false;

    try {
      const platform = this.getPlatform();

      if (platform === "android") {
        const plugin = await loadNativePlugin("HealthConnect");
        if (!plugin) return false;
        const result = await plugin.requestAuthorization({
          read: ["Steps", "TotalCaloriesBurned", "Distance", "ExerciseSession"],
          write: ["ExerciseSession"],
        });
        this.connected = result.granted;
        return result.granted;
      }

      if (platform === "ios") {
        const plugin = await loadNativePlugin("HealthKit");
        if (!plugin) return false;
        const result = await plugin.requestAuthorization({
          read: ["stepCount", "activeEnergyBurned", "distanceWalkingRunning", "appleExerciseTime"],
          write: ["appleExerciseTime"],
        });
        this.connected = result.granted;
        return result.granted;
      }

      return false;
    } catch (error) {
      console.error("[HealthService] Authorization failed:", error);
      return false;
    }
  }

  async getTodayData(): Promise<HealthData> {
    if (!this.isNative || !this.connected) return DEFAULT_DATA;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today.toISOString();
    const endDate = new Date().toISOString();

    try {
      const platform = this.getPlatform();

      if (platform === "android") {
        const plugin = await loadNativePlugin("HealthConnect");
        if (!plugin) return DEFAULT_DATA;

        const [steps, calories, distance, exercise] = await Promise.all([
          plugin.readRecords({ type: "Steps", startTime: startDate, endTime: endDate }).catch(() => ({ records: [] })),
          plugin.readRecords({ type: "TotalCaloriesBurned", startTime: startDate, endTime: endDate }).catch(() => ({ records: [] })),
          plugin.readRecords({ type: "Distance", startTime: startDate, endTime: endDate }).catch(() => ({ records: [] })),
          plugin.readRecords({ type: "ExerciseSession", startTime: startDate, endTime: endDate }).catch(() => ({ records: [] })),
        ]);

        return {
          steps: steps.records.reduce((sum: number, r: any) => sum + (r.count || 0), 0),
          calories: Math.round(calories.records.reduce((sum: number, r: any) => sum + (r.energy?.inKilocalories || 0), 0)),
          distance: Math.round(distance.records.reduce((sum: number, r: any) => sum + (r.distance?.inMeters || 0), 0)),
          workoutMinutes: Math.round(exercise.records.reduce((sum: number, r: any) => {
            const start = new Date(r.startTime).getTime();
            const end = new Date(r.endTime).getTime();
            return sum + (end - start) / 60000;
          }, 0)),
          lastSync: new Date().toISOString(),
        };
      }

      if (platform === "ios") {
        const plugin = await loadNativePlugin("HealthKit");
        if (!plugin) return DEFAULT_DATA;

        const [steps, calories, distance, exercise] = await Promise.all([
          plugin.queryQuantityType({ type: "stepCount", startDate, endDate }).catch(() => ({ value: 0 })),
          plugin.queryQuantityType({ type: "activeEnergyBurned", startDate, endDate }).catch(() => ({ value: 0 })),
          plugin.queryQuantityType({ type: "distanceWalkingRunning", startDate, endDate }).catch(() => ({ value: 0 })),
          plugin.queryQuantityType({ type: "appleExerciseTime", startDate, endDate }).catch(() => ({ value: 0 })),
        ]);

        return {
          steps: Math.round(steps.value || 0),
          calories: Math.round(calories.value || 0),
          distance: Math.round((distance.value || 0) * 1000),
          workoutMinutes: Math.round(exercise.value || 0),
          lastSync: new Date().toISOString(),
        };
      }

      return DEFAULT_DATA;
    } catch (error) {
      console.error("[HealthService] Error reading data:", error);
      return DEFAULT_DATA;
    }
  }

  async writeWorkout(durationMinutes: number, caloriesBurned?: number): Promise<boolean> {
    if (!this.isNative || !this.connected) return false;

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - durationMinutes * 60000);

    try {
      const platform = this.getPlatform();

      if (platform === "android") {
        const plugin = await loadNativePlugin("HealthConnect");
        if (!plugin) return false;
        await plugin.insertRecords({
          records: [{
            type: "ExerciseSession",
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            exerciseType: "PILATES",
            title: "Pilates - MyPilatesPlan",
          }],
        });
        return true;
      }

      if (platform === "ios") {
        const plugin = await loadNativePlugin("HealthKit");
        if (!plugin) return false;
        await plugin.saveWorkout({
          activityType: "pilates",
          startDate: startTime.toISOString(),
          endDate: endTime.toISOString(),
          energyBurned: caloriesBurned || durationMinutes * 4,
          energyBurnedUnit: "kilocalorie",
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("[HealthService] Error writing workout:", error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const healthService = new HealthService();
