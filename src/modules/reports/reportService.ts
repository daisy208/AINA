/**
 * Reports Service
 * Handles report generation and management
 */

import prisma from '../../lib/prisma';
import logger from '../../config/logger';
import { NotFoundError, AuthorizationError } from '../../utils/errors';

/**
 * Create a report
 */
export async function createReport(
  userId: string,
  payload: {
    reportType: string;
    title: string;
    content: string;
    incidentId?: string;
  }
) {
  try {
    const report = await prisma.report.create({
      data: {
        ...payload,
        userId,
        status: 'draft',
      },
      include: { incident: true },
    });

    logger.info('report_created', {
      reportId: report.id,
      userId,
      reportType: payload.reportType,
    });

    return report;
  } catch (error) {
    logger.error('report_creation_failed', {
      userId,
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Get report by ID
 */
export async function getReport(reportId: string, userId?: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      incident: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });

  if (!report) {
    throw new NotFoundError('Report');
  }

  if (userId && report.userId !== userId) {
    throw new AuthorizationError('Not authorized to access this report');
  }

  return report;
}

/**
 * List user's reports
 */
export async function listUserReports(
  userId: string,
  filters: {
    reportType?: string;
    status?: string;
    skip?: number;
    take?: number;
  } = {}
) {
  const { skip = 0, take = 20 } = filters;

  const where: any = { userId };
  if (filters.reportType) where.reportType = filters.reportType;
  if (filters.status) where.status = filters.status;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: { incident: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.report.count({ where }),
  ]);

  return {
    data: reports,
    pagination: { total, skip, take, hasMore: skip + take < total },
  };
}

/**
 * Update report
 */
export async function updateReport(
  reportId: string,
  userId: string,
  payload: {
    title?: string;
    content?: string;
    status?: string;
  }
) {
  const report = await getReport(reportId, userId);

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: payload,
    include: { incident: true },
  });

  logger.info('report_updated', {
    reportId,
    userId,
    status: updated.status,
  });

  return updated;
}

/**
 * Submit report for review
 */
export async function submitReport(reportId: string, userId: string) {
  const report = await getReport(reportId, userId);

  if (report.status !== 'draft') {
    throw new Error('Only draft reports can be submitted');
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: 'submitted',
      submittedAt: new Date(),
    },
    include: { incident: true },
  });

  logger.info('report_submitted', { reportId, userId });

  return updated;
}

/**
 * Delete report
 */
export async function deleteReport(reportId: string, userId: string) {
  const report = await getReport(reportId, userId);

  await prisma.report.delete({
    where: { id: reportId },
  });

  logger.info('report_deleted', { reportId, userId });
}
