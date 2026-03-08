/**
 * Health Service - Google Fit & Apple Health integration via Capacitor
 * 
 * This service wraps the @nicepayments/capacitor-health-connect plugin (Android)
 * and @nicepayments/capacitor-healthkit plugin (iOS) for reading/writing health data.
 * 
 * NOTE: These plugins only work on native devices (not in web preview).
 * The service gracefully degrades in web mode.
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

class HealthService {
  private isNative = Capacitor.isNativePlatform();
  private connected = false;

  /**
   * Check if Health integration is available on this platform
   */
  isAvailable(): boolean {
    return this.isNative;
  }

  /**
   * Get current platform name
   */
  getPlatform(): "ios" | "android" | "web" {
    if (!this.isNative) return "web";
    return Capacitor.getPlatform() as "ios" | "android";
  }

  /**
   * Request authorization to access health data
   * Returns true if authorized, false otherwise
   */
  async requestAuthorization(): Promise<boolean> {
    if (!this.isNative) {
      console.log("[HealthService] Not on native platform, skipping auth");
      return false;
    }

    try {
      const platform = this.getPlatform();

      if (platform === "android") {
        // Google Health Connect (Google Fit successor)
        const { HealthConnect } = await import("@nicepayments/capacitor-health-connect" as any);
        const result = await HealthConnect.requestAuthorization({
          read: ["Steps", "TotalCaloriesBurned", "Distance", "ExerciseSession"],
          write: ["ExerciseSession"],
        });
        this.connected = result.granted;
        return result.granted;
      }

      if (platform === "ios") {
        // Apple HealthKit
        const { HealthKit } = await import("@nicepayments/capacitor-healthkit" as any);
        const result = await HealthKit.requestAuthorization({
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

  /**
   * Read today's health data
   */
  async getTodayData(): Promise<HealthData> {
    if (!this.isNative || !this.connected) return DEFAULT_DATA;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today.toISOString();
    const endDate = new Date().toISOString();

    try {
      const platform = this.getPlatform();

      if (platform === "android") {
        const { HealthConnect } = await import("@nicepayments/capacitor-health-connect" as any);

        const [steps, calories, distance, exercise] = await Promise.all([
          HealthConnect.readRecords({ type: "Steps", startTime: startDate, endTime: endDate }).catch(() => ({ records: [] })),
          HealthConnect.readRecords({ type: "TotalCaloriesBurned", startTime: startDate, endTime: endDate }).catch(() => ({ records: [] })),
          HealthConnect.readRecords({ type: "Distance", startTime: startDate, endTime: endDate }).catch(() => ({ records: [] })),
          HealthConnect.readRecords({ type: "ExerciseSession", startTime: startDate, endTime: endDate }).catch(() => ({ records: [] })),
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
        const { HealthKit } = await import("@nicepayments/capacitor-healthkit" as any);

        const [steps, calories, distance, exercise] = await Promise.all([
          HealthKit.queryQuantityType({ type: "stepCount", startDate, endDate }).catch(() => ({ value: 0 })),
          HealthKit.queryQuantityType({ type: "activeEnergyBurned", startDate, endDate }).catch(() => ({ value: 0 })),
          HealthKit.queryQuantityType({ type: "distanceWalkingRunning", startDate, endDate }).catch(() => ({ value: 0 })),
          HealthKit.queryQuantityType({ type: "appleExerciseTime", startDate, endDate }).catch(() => ({ value: 0 })),
        ]);

        return {
          steps: Math.round(steps.value || 0),
          calories: Math.round(calories.value || 0),
          distance: Math.round((distance.value || 0) * 1000), // km to m
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

  /**
   * Write a Pilates workout session to Health
   */
  async writeWorkout(durationMinutes: number, caloriesBurned?: number): Promise<boolean> {
    if (!this.isNative || !this.connected) return false;

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - durationMinutes * 60000);

    try {
      const platform = this.getPlatform();

      if (platform === "android") {
        const { HealthConnect } = await import("@nicepayments/capacitor-health-connect" as any);
        await HealthConnect.insertRecords({
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
        const { HealthKit } = await import("@nicepayments/capacitor-healthkit" as any);
        await HealthKit.saveWorkout({
          activityType: "pilates",
          startDate: startTime.toISOString(),
          endDate: endTime.toISOString(),
          energyBurned: caloriesBurned || durationMinutes * 4, // rough estimate
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
