/**
 * Job database operations for Zirak HR
 * 
 * This file contains functions for interacting with job-related tables
 * in the Supabase database.
 */

import supabase from '../supabase';
import { 
  Job, 
  JobStatus, 
  JobSkill, 
  JobBenefit, 
  JobRequirement,
  Skill
} from './types';

/**
 * Get all jobs with optional filtering
 * @param filters Optional filters to apply
 * @returns Array of jobs and any error
 */
export async function getAllJobs(filters?: {
  status?: JobStatus;
  companyId?: string;
  postedBy?: string;
  remote?: boolean;
  industry?: string;
  department?: string;
}): Promise<{ jobs: Job[] | null, error: any }> {
  try {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        company:companies(name, logo_url),
        skills:job_skills(
          skill_id,
          importance,
          skills:skills(name, category)
        ),
        benefits:job_benefits(benefit),
        requirements:job_requirements(requirement)
      `);
    
    // Apply filters if provided
    if (filters) {
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.companyId) query = query.eq('company_id', filters.companyId);
      if (filters.postedBy) query = query.eq('posted_by', filters.postedBy);
      if (filters.remote !== undefined) query = query.eq('remote', filters.remote);
      if (filters.industry) query = query.eq('industry', filters.industry);
      if (filters.department) query = query.eq('department', filters.department);
    }
    
    // Order by posted date (newest first)
    query = query.order('posted_date', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return { jobs: null, error };
    }
    
    return { jobs: data, error: null };
  } catch (error) {
    console.error('Exception in getAllJobs:', error);
    return { jobs: null, error };
  }
}

/**
 * Create a new job
 * @param jobData Job data to create
 * @param skills Skills to associate with the job
 * @param benefits Benefits to associate with the job
 * @param requirements Requirements to associate with the job
 * @returns The created job or null if an error occurred
 */
export async function createJob(
  jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>,
  skills?: { skillId: string, importance: number }[],
  benefits?: string[],
  requirements?: string[]
): Promise<{ job: Job | null, error: any }> {
  // Start a Supabase transaction
  const { data, error } = await supabase.rpc('begin_transaction');
  
  if (error) {
    console.error('Error beginning transaction:', error);
    return { job: null, error };
  }
  
  try {
    // Create the job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        ...jobData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (jobError) {
      console.error('Error creating job:', jobError);
      await supabase.rpc('rollback_transaction');
      return { job: null, error: jobError };
    }
    
    // Add skills if provided
    if (skills && skills.length > 0) {
      const skillsToInsert = skills.map(skill => ({
        job_id: job.id,
        skill_id: skill.skillId,
        importance: skill.importance,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: skillsError } = await supabase
        .from('job_skills')
        .insert(skillsToInsert);
      
      if (skillsError) {
        console.error('Error adding job skills:', skillsError);
        await supabase.rpc('rollback_transaction');
        return { job: null, error: skillsError };
      }
    }
    
    // Add benefits if provided
    if (benefits && benefits.length > 0) {
      const benefitsToInsert = benefits.map(benefit => ({
        job_id: job.id,
        benefit,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: benefitsError } = await supabase
        .from('job_benefits')
        .insert(benefitsToInsert);
      
      if (benefitsError) {
        console.error('Error adding job benefits:', benefitsError);
        await supabase.rpc('rollback_transaction');
        return { job: null, error: benefitsError };
      }
    }
    
    // Add requirements if provided
    if (requirements && requirements.length > 0) {
      const requirementsToInsert = requirements.map(requirement => ({
        job_id: job.id,
        requirement,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: requirementsError } = await supabase
        .from('job_requirements')
        .insert(requirementsToInsert);
      
      if (requirementsError) {
        console.error('Error adding job requirements:', requirementsError);
        await supabase.rpc('rollback_transaction');
        return { job: null, error: requirementsError };
      }
    }
    
    // Commit the transaction
    await supabase.rpc('commit_transaction');
    
    return { job, error: null };
  } catch (error) {
    console.error('Exception in createJob:', error);
    await supabase.rpc('rollback_transaction');
    return { job: null, error };
  }
}

/**
 * Find a job by ID with all related data
 * @param id Job ID to search for
 * @returns The job with related data or null if not found
 */
export async function findJobById(id: string): Promise<{
  job: Job | null;
  skills: (JobSkill & { skill: Skill })[] | null;
  benefits: JobBenefit[] | null;
  requirements: JobRequirement[] | null;
}> {
  try {
    // Get the job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        company:companies(name, logo_url, industry, size, website)
      `)
      .eq('id', id)
      .single();
    
    if (jobError) {
      console.error('Error finding job by ID:', jobError);
      return {
        job: null,
        skills: null,
        benefits: null,
        requirements: null
      };
    }
    
    // Get skills with skill details
    const { data: skills, error: skillsError } = await supabase
      .from('job_skills')
      .select(`
        *,
        skill:skills(*)
      `)
      .eq('job_id', id);
    
    if (skillsError) {
      console.error('Error getting job skills:', skillsError);
    }
    
    // Get benefits
    const { data: benefits, error: benefitsError } = await supabase
      .from('job_benefits')
      .select('*')
      .eq('job_id', id);
    
    if (benefitsError) {
      console.error('Error getting job benefits:', benefitsError);
    }
    
    // Get requirements
    const { data: requirements, error: requirementsError } = await supabase
      .from('job_requirements')
      .select('*')
      .eq('job_id', id);
    
    if (requirementsError) {
      console.error('Error getting job requirements:', requirementsError);
    }
    
    return {
      job,
      skills: skills || null,
      benefits: benefits || null,
      requirements: requirements || null
    };
  } catch (error) {
    console.error('Exception in findJobById:', error);
    return {
      job: null,
      skills: null,
      benefits: null,
      requirements: null
    };
  }
}

/**
 * Update a job
 * @param id Job ID to update
 * @param jobData Job data to update
 * @returns The updated job or null if an error occurred
 */
export async function updateJob(id: string, jobData: Partial<Job>): Promise<Job | null> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        ...jobData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in updateJob:', error);
    return null;
  }
}

/**
 * Update job skills
 * @param jobId Job ID to update skills for
 * @param skills Skills to associate with the job
 * @returns True if successful, false otherwise
 */
export async function updateJobSkills(
  jobId: string,
  skills: { skillId: string, importance: number }[]
): Promise<boolean> {
  try {
    // Start a Supabase transaction
    const { error: txError } = await supabase.rpc('begin_transaction');
    
    if (txError) {
      console.error('Error beginning transaction:', txError);
      return false;
    }
    
    // Delete existing skills
    const { error: deleteError } = await supabase
      .from('job_skills')
      .delete()
      .eq('job_id', jobId);
    
    if (deleteError) {
      console.error('Error deleting job skills:', deleteError);
      await supabase.rpc('rollback_transaction');
      return false;
    }
    
    // Add new skills
    if (skills.length > 0) {
      const skillsToInsert = skills.map(skill => ({
        job_id: jobId,
        skill_id: skill.skillId,
        importance: skill.importance,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: insertError } = await supabase
        .from('job_skills')
        .insert(skillsToInsert);
      
      if (insertError) {
        console.error('Error adding job skills:', insertError);
        await supabase.rpc('rollback_transaction');
        return false;
      }
    }
    
    // Commit the transaction
    await supabase.rpc('commit_transaction');
    
    return true;
  } catch (error) {
    console.error('Exception in updateJobSkills:', error);
    await supabase.rpc('rollback_transaction');
    return false;
  }
}

/**
 * Update job benefits
 * @param jobId Job ID to update benefits for
 * @param benefits Benefits to associate with the job
 * @returns True if successful, false otherwise
 */
export async function updateJobBenefits(
  jobId: string,
  benefits: string[]
): Promise<boolean> {
  try {
    // Start a Supabase transaction
    const { error: txError } = await supabase.rpc('begin_transaction');
    
    if (txError) {
      console.error('Error beginning transaction:', txError);
      return false;
    }
    
    // Delete existing benefits
    const { error: deleteError } = await supabase
      .from('job_benefits')
      .delete()
      .eq('job_id', jobId);
    
    if (deleteError) {
      console.error('Error deleting job benefits:', deleteError);
      await supabase.rpc('rollback_transaction');
      return false;
    }
    
    // Add new benefits
    if (benefits.length > 0) {
      const benefitsToInsert = benefits.map(benefit => ({
        job_id: jobId,
        benefit,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: insertError } = await supabase
        .from('job_benefits')
        .insert(benefitsToInsert);
      
      if (insertError) {
        console.error('Error adding job benefits:', insertError);
        await supabase.rpc('rollback_transaction');
        return false;
      }
    }
    
    // Commit the transaction
    await supabase.rpc('commit_transaction');
    
    return true;
  } catch (error) {
    console.error('Exception in updateJobBenefits:', error);
    await supabase.rpc('rollback_transaction');
    return false;
  }
}

/**
 * Update job requirements
 * @param jobId Job ID to update requirements for
 * @param requirements Requirements to associate with the job
 * @returns True if successful, false otherwise
 */
export async function updateJobRequirements(
  jobId: string,
  requirements: string[]
): Promise<boolean> {
  try {
    // Start a Supabase transaction
    const { error: txError } = await supabase.rpc('begin_transaction');
    
    if (txError) {
      console.error('Error beginning transaction:', txError);
      return false;
    }
    
    // Delete existing requirements
    const { error: deleteError } = await supabase
      .from('job_requirements')
      .delete()
      .eq('job_id', jobId);
    
    if (deleteError) {
      console.error('Error deleting job requirements:', deleteError);
      await supabase.rpc('rollback_transaction');
      return false;
    }
    
    // Add new requirements
    if (requirements.length > 0) {
      const requirementsToInsert = requirements.map(requirement => ({
        job_id: jobId,
        requirement,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: insertError } = await supabase
        .from('job_requirements')
        .insert(requirementsToInsert);
      
      if (insertError) {
        console.error('Error adding job requirements:', insertError);
        await supabase.rpc('rollback_transaction');
        return false;
      }
    }
    
    // Commit the transaction
    await supabase.rpc('commit_transaction');
    
    return true;
  } catch (error) {
    console.error('Exception in updateJobRequirements:', error);
    await supabase.rpc('rollback_transaction');
    return false;
  }
}

/**
 * Delete a job and all related data
 * @param jobId Job ID to delete
 * @returns True if successful, false otherwise
 */
export async function deleteJob(jobId: string): Promise<boolean> {
  try {
    // Delete the job - cascade will handle related records
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    
    if (error) {
      console.error('Error deleting job:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in deleteJob:', error);
    return false;
  }
}

/**
 * Find or create a skill
 * @param skillName Skill name
 * @param category Optional skill category
 * @returns The skill or null if an error occurred
 */
export async function findOrCreateSkill(skillName: string, category?: string): Promise<Skill | null> {
  try {
    // Try to find the skill first
    const { data: existingSkill } = await supabase
      .from('skills')
      .select('*')
      .ilike('name', skillName)
      .single();
    
    if (existingSkill) {
      return existingSkill;
    }
    
    // Create the skill if it doesn't exist
    const { data: newSkill, error } = await supabase
      .from('skills')
      .insert({
        name: skillName,
        category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating skill:', error);
      return null;
    }
    
    return newSkill;
  } catch (error) {
    console.error('Exception in findOrCreateSkill:', error);
    return null;
  }
}

/**
 * Search for skills by name
 * @param query Search query
 * @returns Array of matching skills or null if an error occurred
 */
export async function searchSkills(query: string): Promise<Skill[] | null> {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20);
    
    if (error) {
      console.error('Error searching skills:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in searchSkills:', error);
    return null;
  }
}
