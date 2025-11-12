import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Vehicle } from 'src/common/types/vehicle';

@Injectable()
export class FleetService {
  private data: Record<string, Vehicle[]> = {};
  private index: Record<string, number> = {};

  constructor() {
    this.loadAndNormalizeData();
  }

  /** Step 1: Load and normalize movement data per vehicle */
  private loadAndNormalizeData() {
    const dataDir = path.join(__dirname, '../../data');
    const files = fs.readdirSync(dataDir);

    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      const vehicleId = file.replace('.json', '');

      // Filter relevant events & normalize
      const timeline: Vehicle[] = raw
        .filter((e: any) =>
          ['trip_started', 'location_ping', 'trip_completed'].includes(e.event_type)
        )
        .map((e: any) => this.normalizeEvent(e));

      // ✅ Forward-fill planned_distance_km so it doesn't disappear in later events
      let plannedDist: number | undefined;
      for (const p of timeline) {
        if (typeof p.planned_distance_km === 'number') {
          plannedDist = p.planned_distance_km;
        }
        if (plannedDist !== undefined && p.planned_distance_km === undefined) {
          p.planned_distance_km = plannedDist;
        }
      }

      this.data[vehicleId] = timeline;
      this.index[vehicleId] = 0;

      console.log(`✅ Loaded ${timeline.length} data points for vehicle: ${vehicleId}`);
    });
  }

  /** Convert raw event → unified vehicle structure */
  private normalizeEvent(e: any): Vehicle {
    let status: 'moving' | 'idle' | 'stopped' | 'completed' = 'idle';
    let speed = 0;
    let completed = false;

    if (e.event_type === 'location_ping') {
      speed = e.movement?.speed_kmh ?? 0;
      status = e.movement?.moving ? 'moving' : 'idle';
    }

    if (e.event_type === 'trip_started') {
      completed = false;
    }

    if (e.event_type === 'trip_completed') {
      status = 'completed';
      completed = true;
      speed = 0;
    }

    return {
      id: e.vehicle_id,
      lat: e.location?.lat ?? 0,
      lng: e.location?.lng ?? 0,
      speed,
      status,
      planned_distance_km: e.planned_distance_km,
      distance_travelled_km: e.distance_travelled_km,
      total_distance_km: e.total_distance_km,
      updatedAt: e.timestamp,
    };
  }

  /** Serve initial snapshot */
  getVehicles(): Vehicle[] {
    return Object.keys(this.data).map(id => {
      const i = this.index[id];
      return this.computeProgress({ ...this.data[id][i] });
    });
  }

  /** Step through timeline & emit updates */
  tick(): Vehicle[] {
    const updates: Vehicle[] = [];

    for (const id of Object.keys(this.data)) {
      const list = this.data[id];
      let i = this.index[id];
      let point = { ...list[i] };

      // ✅ End of journey → freeze
      if (i >= list.length - 1) {
        const last = { ...list[list.length - 1] };
        last.status = 'completed';
        last.speed = 0;
        last.progress = 100;
        last.updatedAt = new Date().toISOString();
        updates.push(last);
        continue;
      }

      // ✅ Compute progress before sending
      point = this.computeProgress(point);

      updates.push(point);
      this.index[id] = i + 1;
    }

    return updates;
  }

  /** Compute progress based on distance traveled vs planned */
  private computeProgress(v: Vehicle): Vehicle {
    if (v.planned_distance_km && v.distance_travelled_km !== undefined) {
      v.progress = Math.min(
        (v.distance_travelled_km / v.planned_distance_km) * 100,
        100
      );
    }
  
    // ✅ Calculate ETC (Estimated Time to Complete)
    if (v.status === 'completed') {
      v.eta = 'Completed';
    } else if (v.speed && v.speed > 0 && v.planned_distance_km && v.distance_travelled_km !== undefined) {
      const remaining = v.planned_distance_km - v.distance_travelled_km;
      const hours = remaining / v.speed;
  
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      v.eta = `${h}h ${m}m`;
    } else {
      v.eta = 'Completed';
    }
  
    return v;
  }
}
