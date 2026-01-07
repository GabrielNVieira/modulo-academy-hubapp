/**
 * Services & Repositories Index
 * Export all repositories for easy import
 */

export { BaseRepository, type RepositoryContext } from './base.repository';

import { ProgressRepository, progressRepository } from './progress.repository';
export { ProgressRepository, progressRepository };

import { CourseRepository, courseRepository } from './course.repository';
export { CourseRepository, courseRepository };

import { MissionRepository, missionRepository } from './mission.repository';
export { MissionRepository, missionRepository };

import { BadgeRepository, badgeRepository } from './badge.repository';
export { BadgeRepository, badgeRepository };

// Export all singletons as a group
export const repositories = {
    progress: progressRepository,
    course: courseRepository,
    mission: missionRepository,
    badge: badgeRepository
};
