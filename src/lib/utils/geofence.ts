/**
 * GPS Geofencing Module for Jana Post Logistics Hubs & Couriers
 * Provides calculation of geodesic distances (Haversine formula) and
 * coordinates validation against official sorting centers in Kazakhstan.
 */

export interface LogisticsHub {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

export const JANA_POST_HUBS: LogisticsHub[] = [
  {
    id: 'hub-almaty-north',
    name: 'Главный логистический хаб «Алматы-Север»',
    city: 'Алматы',
    address: 'ул. Северное Кольцо, 45Б',
    lat: 43.3400,
    lng: 76.9200,
    radiusMeters: 800,
  },
  {
    id: 'hub-astana-transit',
    name: 'Транзитно-сортировочный терминал «Астана»',
    city: 'Астана',
    address: 'шоссе Алаш, 18/1',
    lat: 51.1605,
    lng: 71.4704,
    radiusMeters: 600,
  },
  {
    id: 'hub-shymkent-south',
    name: 'Южный распределительный центр «Шымкент»',
    city: 'Шымкент',
    address: 'Тамерлановское шоссе, 92',
    lat: 42.3417,
    lng: 69.5901,
    radiusMeters: 700,
  },
  {
    id: 'hub-karaganda-central',
    name: 'Складской терминал «Караганда-Центр»',
    city: 'Караганда',
    address: 'ул. Складская, 12',
    lat: 49.8047,
    lng: 73.1094,
    radiusMeters: 500,
  },
  {
    id: 'hub-aktobe-west',
    name: 'Западный почтовый филиал «Актобе»',
    city: 'Актобе',
    address: 'пр. Санкибай Батыра, 26',
    lat: 50.2839,
    lng: 57.1670,
    radiusMeters: 500,
  },
];

/**
 * Calculates great-circle distance between two GPS coordinates using the Haversine formula
 * @returns distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface GeofenceVerificationResult {
  verified: boolean;
  hub: LogisticsHub | null;
  distanceMeters: number;
  message: string;
}

/**
 * Checks if given coordinates fall inside any authorized Jana Post logistics hub
 */
export function verifyHubGeofence(
  lat: number,
  lng: number,
  targetHubId?: string
): GeofenceVerificationResult {
  if (targetHubId) {
    const hub = JANA_POST_HUBS.find((h) => h.id === targetHubId);
    if (hub) {
      const dist = calculateDistanceMeters(lat, lng, hub.lat, hub.lng);
      const verified = dist <= hub.radiusMeters;
      return {
        verified,
        hub,
        distanceMeters: dist,
        message: verified
          ? `Внутри геозоны: ${hub.name} (${dist} м от центра)`
          : `Вне геозоны: ${hub.name} (${dist} м при допустимом радиусе ${hub.radiusMeters} м)`,
      };
    }
  }

  // Find closest hub among all
  let closestHub: LogisticsHub | null = null;
  let minDistance = Infinity;

  for (const hub of JANA_POST_HUBS) {
    const dist = calculateDistanceMeters(lat, lng, hub.lat, hub.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }
  }

  if (closestHub && minDistance <= closestHub.radiusMeters) {
    return {
      verified: true,
      hub: closestHub,
      distanceMeters: minDistance,
      message: `Подтверждено: ${closestHub.name} (${minDistance} м от центра)`,
    };
  }

  return {
    verified: false,
    hub: closestHub,
    distanceMeters: minDistance === Infinity ? 0 : minDistance,
    message: closestHub
      ? `Удаленная отметка: ${Math.round(minDistance / 1000)} км до ближайшего хаба (${closestHub.city})`
      : 'Координаты вне обслуживаемых хабов',
  };
}
