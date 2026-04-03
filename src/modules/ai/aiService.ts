/**
 * AI Insights Service
 * Provides incident analysis, pattern detection, and risk scoring
 */

import prisma from '../lib/prisma';
import logger from '../config/logger';
import { clusterIncidents, haversineDistance, Coordinate } from '../lib/geo';

interface IncidentWithLocation {
  id: string;
  userId: string;
  type: string;
  severity: string;
  latitude?: number | null;
  longitude?: number | null;
  timestamp: Date;
}

/**
 * Generate AI insights for a single incident
 */
export async function generateIncidentInsight(
  userId: string,
  incidentId: string
): Promise<any> {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      include: { user: true },
    });

    if (!incident) {
      throw new Error('Incident not found');
    }

    // Analyze incident patterns
    const riskScore = await calculateIncidentRiskScore(incident);
    const patternAnalysis = await detectIncidentPatterns(userId, incident);

    // Generate legal summary
    const legalSummary = generateLegalSummary(incident);

    // Check for escalation patterns
    const escalation = await checkEscalationPattern(userId);

    // Create AI insight record
    const insight = await prisma.aIInsight.create({
      data: {
        userId,
        incidentId,
        riskLevel: getRiskLevel(riskScore),
        legalSummary,
        escalation,
        confidenceScore: Math.min(riskScore, 1.0),
        patternType: patternAnalysis?.type,
        patternMetadata: patternAnalysis?.metadata,
        riskFactors: patternAnalysis?.riskFactors || [],
        recommendations: generateRecommendations(riskScore, patternAnalysis),
      },
    });

    logger.info('ai_insight_generated', {
      incidentId,
      userId,
      riskScore,
      riskLevel: insight.riskLevel,
    });

    return insight;
  } catch (error) {
    logger.error('ai_insight_generation_failed', {
      incidentId,
      userId,
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Calculate risk score for an incident (0-1)
 */
async function calculateIncidentRiskScore(incident: any): Promise<number> {
  let score = 0.3; // Base score

  // Severity weighting
  const severityWeights: Record<string, number> = {
    critical: 0.9,
    high: 0.7,
    medium: 0.4,
    low: 0.2,
  };
  score += (severityWeights[incident.severity] || 0.4) * 0.3;

  // Type weighting
  const highRiskTypes = ['homicide', 'rape', 'robbery', 'aggravated_assault'];
  if (highRiskTypes.includes(incident.type?.toLowerCase())) {
    score += 0.25;
  }

  // Recency weighting
  const ageMs = Date.now() - incident.timestamp.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  if (ageHours < 24) score += 0.1;
  if (ageHours < 1) score += 0.05;

  return Math.min(score, 1.0);
}

/**
 * Detect patterns in user's incident history
 */
async function detectIncidentPatterns(
  userId: string,
  currentIncident: any
): Promise<{
  type?: string;
  metadata?: Record<string, any>;
  riskFactors: string[];
} | null> {
  try {
    // Get user's incidents from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userIncidents = await prisma.incident.findMany({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo },
      },
      take: 50,
    });

    const riskFactors: string[] = [];

    // Check for repeated incidents
    const incidentTypeCounts = userIncidents.reduce(
      (acc, inc) => {
        acc[inc.type] = (acc[inc.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    if (incidentTypeCounts[currentIncident.type] > 2) {
      riskFactors.push('repeated_incident_type');
    }

    // Check for geographic clustering
    if (currentIncident.latitude && currentIncident.longitude) {
      const nearby = userIncidents.filter(
        (inc) =>
          inc.latitude &&
          inc.longitude &&
          haversineDistance(
            {
              latitude: currentIncident.latitude,
              longitude: currentIncident.longitude,
            },
            { latitude: inc.latitude, longitude: inc.longitude }
          ) < 1 // Within 1 km
      );

      if (nearby.length > 1) {
        riskFactors.push('hotspot_location');
      }
    }

    // Check for rapid successive incidents
    if (userIncidents.length > 0) {
      const lastIncident = userIncidents[0];
      const timeDiff =
        currentIncident.timestamp.getTime() - lastIncident.timestamp.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 24 && userIncidents.length > 2) {
        riskFactors.push('rapid_succession');
      }
    }

    if (riskFactors.length > 0) {
      return {
        type: 'escalation_pattern',
        metadata: {
          incidentCount: userIncidents.length,
          typeCounts: incidentTypeCounts,
        },
        riskFactors,
      };
    }

    return { riskFactors };
  } catch (error) {
    logger.error('pattern_detection_failed', {
      userId,
      error: (error as Error).message,
    });
    return { riskFactors: [] };
  }
}

/**
 * Check for escalation patterns
 */
async function checkEscalationPattern(userId: string): Promise<boolean> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const incidents = await prisma.incident.findMany({
      where: {
        userId,
        timestamp: { gte: thirtyDaysAgo },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    if (incidents.length < 3) return false;

    // Check if severity is increasing
    const severityOrder = ['low', 'medium', 'high', 'critical'];
    let escalating = true;

    for (let i = 0; i < incidents.length - 1; i++) {
      const currentSeverity = severityOrder.indexOf(
        incidents[i].severity || 'medium'
      );
      const nextSeverity = severityOrder.indexOf(
        incidents[i + 1].severity || 'medium'
      );

      if (currentSeverity < nextSeverity) {
        escalating = false;
        break;
      }
    }

    return escalating;
  } catch (error) {
    logger.error('escalation_check_failed', {
      userId,
      error: (error as Error).message,
    });
    return false;
  }
}

/**
 * Generate legal summary from incident data
 */
function generateLegalSummary(incident: any): string {
  const timestamp = incident.timestamp.toISOString();
  const location = incident.location || 'Unknown location';
  const type = incident.type?.replace(/_/g, ' ').toLowerCase() || 'incident';
  const severity = incident.severity || 'unknown severity';

  return `Incident Report: ${type.charAt(0).toUpperCase() + type.slice(1)} reported on ${timestamp}. Location: ${location}. Severity: ${severity}. Evidence hash: ${incident.evidenceHash}`;
}

/**
 * Generate recommendations based on risk analysis
 */
function generateRecommendations(
  riskScore: number,
  patternAnalysis: any
): string[] {
  const recommendations: string[] = [];

  if (riskScore > 0.7) {
    recommendations.push('Escalate to law enforcement');
    recommendations.push('Contact emergency services');
  }

  if (riskScore > 0.5) {
    recommendations.push('Increase monitoring');
    recommendations.push('Review incident for investigation');
  }

  if (patternAnalysis?.riskFactors?.includes('hotspot_location')) {
    recommendations.push('Increase patrols in area');
    recommendations.push('Alert nearby safety systems');
  }

  if (patternAnalysis?.riskFactors?.includes('escalation_pattern')) {
    recommendations.push('Prioritize for follow-up');
    recommendations.push('Consider Pattern-based intervention');
  }

  return recommendations;
}

/**
 * Determine risk level label
 */
function getRiskLevel(score: number): string {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

/**
 * Detect hotspots and clusters
 */
export async function detectHotspots(
  cityOrCountry?: string,
  maxClusters: number = 10
) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let incidents = await prisma.incident.findMany({
      where: {
        timestamp: { gte: thirtyDaysAgo },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        severity: true,
        type: true,
      },
    });

    const clusters = clusterIncidents(incidents as any, maxClusters);

    return clusters.map((cluster) => ({
      center: cluster.center,
      radius: cluster.radius,
      incidentCount: cluster.incidents.length,
      incidentTypes: [
        ...new Set(cluster.incidents.map((inc) => (inc as any).type)),
      ],
    }));
  } catch (error) {
    logger.error('hotspot_detection_failed', {
      error: (error as Error).message,
    });
    return [];
  }
}
