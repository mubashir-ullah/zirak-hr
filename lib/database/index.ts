/**
 * Database operations for Zirak HR
 * 
 * This file exports all database operations from the various modules
 * to provide a clean API for interacting with the database.
 */

// Export all types
export * from './types';

// Export user operations
export {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updateUserRole,
  linkSocialAccount,
  getUserSocialAccounts,
  findUserBySocialProvider,
  deleteUser
} from './users';

// Export talent profile operations
export {
  upsertTalentProfile,
  getTalentProfileByUserId,
  getTalentProfileWithRelations,
  addTalentSkill,
  removeTalentSkill,
  upsertTalentEducation,
  removeTalentEducation,
  upsertTalentExperience,
  removeTalentExperience,
  updateTalentPreferences,
  upsertTalentLanguage,
  removeTalentLanguage
} from './talent-profiles';

// Export job operations
export {
  getAllJobs,
  createJob,
  findJobById,
  updateJob,
  updateJobSkills,
  updateJobBenefits,
  updateJobRequirements,
  deleteJob,
  findOrCreateSkill,
  searchSkills
} from './jobs';

// Export application operations
export {
  createJobApplication,
  findJobApplicationById,
  findJobApplicationsByUserId,
  findJobApplicationsByJobId,
  updateJobApplicationStatus,
  scheduleInterview,
  getInterviewsByApplicationId,
  updateInterview,
  saveJob,
  unsaveJob,
  getSavedJobsByUserId,
  isJobSavedByUser,
  recordJobView
} from './applications';
