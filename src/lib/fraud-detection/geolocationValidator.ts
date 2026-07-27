/**
 * Geolocation Validation Module for Fraud Detection
 * 
 * Validates:
 * - Location plausibility
 * - User movement patterns
 * - GPS data consistency
 * - Location spoofing detection
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get user's last known location (from previous submissions)
 * In production, would fetch from database
 */
export function getUserLastLocation(
  userLocations: Array<{ lat: number; lng: number; timestamp: Date }>
): { lat: number; lng: number; timestamp: Date } | null {
  if (!userLocations || userLocations.length === 0) {
    return null;
  }

  // Sort by timestamp and get most recent
  return userLocations.reduce((latest, current) => {
    return current.timestamp > latest.timestamp ? current : latest;
  });
}

/**
 * Extract location from image EXIF data (GPS)
 */
export function extractLocationFromImage(
  exifData?: Record<string, any>
): { lat: number; lng: number; accuracy: number } | null {
  if (!exifData?.GPSLatitude || !exifData?.GPSLongitude) {
    return null;
  }

  try {
    return {
      lat: exifData.GPSLatitude as number,
      lng: exifData.GPSLongitude as number,
      accuracy: exifData.GPSAccuracy || 10, // Meters, assume 10m if not specified
    };
  } catch (error) {
    console.error("Error extracting GPS from EXIF:", error);
    return null;
  }
}

/**
 * Validate location plausibility
 * Checks if location makes physical sense for the user
 */
export function validateLocationPlausibility(
  currentLocation: { lat: number; lng: number } | null | undefined,
  userProfile?: { city?: string; country?: string },
  previousLocations?: Array<{ lat: number; lng: number; timestamp: Date }>
): {
  isPlausible: boolean;
  confidence: number; // 0-1
  flags: string[];
} {
  const flags: string[] = [];
  let confidence = 1.0;

  if (!currentLocation) {
    return {
      isPlausible: true, // Can't validate without location
      confidence: 0.5, // Neutral
      flags: ["No GPS location available"],
    };
  }

  // Check 1: Location within valid GPS ranges
  if (currentLocation.lat < -90 || currentLocation.lat > 90) {
    flags.push("Invalid latitude");
    return { isPlausible: false, confidence: 0, flags };
  }
  if (currentLocation.lng < -180 || currentLocation.lng > 180) {
    flags.push("Invalid longitude");
    return { isPlausible: false, confidence: 0, flags };
  }

  // Check 2: Not at invalid locations (null island, etc.)
  if (currentLocation.lat === 0 && currentLocation.lng === 0) {
    flags.push("Location at null island (0,0)");
    confidence -= 0.4;
  }

  // Check 3: Compare to previous locations (plausible distance traveled)
  if (previousLocations && previousLocations.length > 0) {
    const lastLocation = getUserLastLocation(previousLocations);
    if (lastLocation) {
      const distance = calculateDistance(
        lastLocation.lat,
        lastLocation.lng,
        currentLocation.lat,
        currentLocation.lng
      );
      const timeDiffMs = Date.now() - lastLocation.timestamp.getTime();
      const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

      // Maximum plausible speed: 900 km/h (jet travel)
      const maxPlausibleDistance = 900 * timeDiffHours;

      if (distance > maxPlausibleDistance && timeDiffHours > 1) {
        flags.push(
          `Traveled ${Math.floor(distance)}km in ${Math.floor(timeDiffHours)}h (${(distance / timeDiffHours).toFixed(0)}km/h)`
        );
        confidence -= 0.5;
      } else if (distance > 500 && timeDiffHours < 1) {
        flags.push(`Traveled ${Math.floor(distance)}km in less than 1 hour`);
        confidence -= 0.2;
      }
    }
  }

  return {
    isPlausible: confidence > 0.2,
    confidence: Math.max(0, Math.min(1, confidence)),
    flags,
  };
}

/**
 * Check location consistency
 * Validates that location is consistent with user's typical area
 */
export function checkLocationConsistency(
  currentLocation: { lat: number; lng: number } | null | undefined,
  previousLocations?: Array<{ lat: number; lng: number }>,
  homeCityCoords?: { lat: number; lng: number }
): {
  score: number; // 0-1
  flags: string[];
  nearHome: boolean;
  nearPreviousLocations: boolean;
} {
  const flags: string[] = [];
  let score = 1.0;
  let nearHome = false;
  let nearPreviousLocations = false;

  if (!currentLocation) {
    return {
      score: 0.5,
      flags: ["No location data"],
      nearHome: false,
      nearPreviousLocations: false,
    };
  }

  // Check proximity to home
  if (homeCityCoords) {
    const distToHome = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      homeCityCoords.lat,
      homeCityCoords.lng
    );

    if (distToHome < 50) {
      // Within 50km of home
      nearHome = true;
      score = 1.0;
    } else if (distToHome < 200) {
      // Within 200km
      score = 0.8;
    } else {
      flags.push(`Far from home (${Math.floor(distToHome)}km)`);
      score -= 0.2;
    }
  }

  // Check proximity to previous locations
  if (previousLocations && previousLocations.length > 0) {
    let minDistance = Infinity;

    for (const prevLoc of previousLocations.slice(-10)) {
      // Check last 10 locations
      const dist = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        prevLoc.lat,
        prevLoc.lng
      );
      minDistance = Math.min(minDistance, dist);
    }

    if (minDistance < 50) {
      // Within 50km of previous location
      nearPreviousLocations = true;
      if (score < 0.9) score = 0.9;
    } else if (minDistance > 500) {
      flags.push(`New location far from previous (${Math.floor(minDistance)}km)`);
      score -= 0.1;
    }
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    flags,
    nearHome,
    nearPreviousLocations,
  };
}

/**
 * Detect location spoofing
 */
export function detectLocationSpoofing(
  currentLocation: { lat: number; lng: number } | null | undefined,
  submissionTime: Date,
  previousSubmissions?: Array<{
    location: { lat: number; lng: number };
    timestamp: Date;
  }>
): {
  spoofingDetected: boolean;
  confidence: number; // 0-1
  flags: string[];
} {
  const flags: string[] = [];
  let spoofingScore = 0;

  if (!currentLocation) {
    return { spoofingDetected: false, confidence: 0, flags: ["No location data"] };
  }

  // Check 1: Impossible movement between submissions
  if (previousSubmissions && previousSubmissions.length > 0) {
    const lastSubmission = previousSubmissions[previousSubmissions.length - 1];
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      lastSubmission.location.lat,
      lastSubmission.location.lng
    );
    const timeDiffHours =
      (submissionTime.getTime() - lastSubmission.timestamp.getTime()) / (1000 * 60 * 60);

    // Teleportation check (> 1000 km/h)
    if (distance > 1000 * timeDiffHours && timeDiffHours > 0.1) {
      flags.push(
        `Impossible movement: ${Math.floor(distance)}km in ${timeDiffHours.toFixed(1)}h`
      );
      spoofingScore += 0.5;
    }

    // Simultaneous submissions from different locations
    if (timeDiffHours < 0.02) {
      // Less than 1.2 minutes
      if (distance > 10) {
        flags.push("Simultaneous submissions from different locations");
        spoofingScore += 0.4;
      }
    }
  }

  // Check 2: Suspicious coordinate patterns
  // Perfect coordinates are suspicious
  if (
    currentLocation.lat % 1 === 0 &&
    currentLocation.lng % 1 === 0
  ) {
    flags.push("Location at whole-number coordinates (suspicious)");
    spoofingScore += 0.2;
  }

  // Check 3: Repeated exact coordinates
  if (previousSubmissions) {
    const exactMatches = previousSubmissions.filter(
      (s) =>
        s.location.lat === currentLocation.lat &&
        s.location.lng === currentLocation.lng
    );

    if (exactMatches.length > 5) {
      flags.push(
        `Same exact coordinates in ${exactMatches.length} submissions`
      );
      spoofingScore += 0.3;
    }
  }

  return {
    spoofingDetected: spoofingScore > 0.3,
    confidence: Math.min(1, spoofingScore),
    flags,
  };
}

/**
 * Validate location for a challenge submission
 */
export async function validateLocationForSubmission(
  submissionLocation: { lat: number; lng: number } | null | undefined,
  challengeLocation?: { lat: number; lng: number },
  userLocations?: Array<{ lat: number; lng: number; timestamp: Date }>,
  userProfile?: { city?: string; country?: string },
  submissionTime?: Date
): Promise<{
  isValid: boolean;
  score: number; // 0-1
  flags: string[];
  details: {
    plausibility: { isPlausible: boolean; confidence: number };
    consistency: { score: number; nearHome: boolean; nearPrevious: boolean };
    spoofing: { detected: boolean; confidence: number };
  };
}> {
  const flags: string[] = [];
  let score = 1.0;

  // Plausibility check
  const plausibility = validateLocationPlausibility(
    submissionLocation,
    userProfile,
    userLocations
  );
  if (!plausibility.isPlausible) {
    score -= 0.4;
    flags.push(...plausibility.flags);
  } else {
    score *= plausibility.confidence;
  }

  // Consistency check
  const consistency = checkLocationConsistency(
    submissionLocation,
    userLocations,
    userProfile ? { lat: 0, lng: 0 } : undefined // Would use real home coords
  );
  score *= consistency.score;
  if (consistency.flags.length > 0) {
    flags.push(...consistency.flags);
  }

  // Spoofing detection
  const spoofing = detectLocationSpoofing(
    submissionLocation,
    submissionTime || new Date(),
    userLocations?.map((loc) => ({
      location: loc,
      timestamp: new Date(),
    }))
  );
  if (spoofing.spoofingDetected) {
    score -= 0.3;
    flags.push(...spoofing.flags);
  }

  // Challenge location check
  if (challengeLocation && submissionLocation) {
    const distanceToChallengeLocation = calculateDistance(
      submissionLocation.lat,
      submissionLocation.lng,
      challengeLocation.lat,
      challengeLocation.lng
    );

    if (distanceToChallengeLocation > 100) {
      flags.push(
        `Submission location ${Math.floor(distanceToChallengeLocation)}km from challenge location`
      );
      // Don't penalize as heavily since challenges might be for other locations
    }
  }

  return {
    isValid: score > 0.3,
    score: Math.max(0, Math.min(1, score)),
    flags,
    details: {
      plausibility,
      consistency: {
        score: consistency.score,
        nearHome: consistency.nearHome,
        nearPrevious: consistency.nearPreviousLocations,
      },
      spoofing: {
        detected: spoofing.spoofingDetected,
        confidence: spoofing.confidence,
      },
    },
  };
}

/**
 * Get location from user device (if available)
 * Requires HTTPS and user permission
 */
export function getUserDeviceLocation(): Promise<{
  lat: number;
  lng: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}
