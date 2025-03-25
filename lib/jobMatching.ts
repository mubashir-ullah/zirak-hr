import supabase from './supabase';

interface MatchScore {
  jobId: string;
  score: number;
  matchedSkills: string[];
  totalSkillsRequired: number;
  matchedRequirements: number;
  totalRequirements: number;
  locationMatch: boolean;
  jobTypeMatch: boolean;
}

/**
 * Calculate match score between a talent profile and a job
 * @param talentId User ID of the talent
 * @param jobId Job ID to match against
 * @returns Match score object or null if matching failed
 */
export async function calculateJobMatchScore(
  talentId: string,
  jobId: string
): Promise<MatchScore | null> {
  try {
    // Get talent profile
    const { data: talentProfile, error: talentError } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', talentId)
      .single();
    
    if (talentError) {
      console.error('Error fetching talent profile:', talentError);
      return null;
    }
    
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (jobError) {
      console.error('Error fetching job:', jobError);
      return null;
    }
    
    // Initialize match score
    const matchScore: MatchScore = {
      jobId,
      score: 0,
      matchedSkills: [],
      totalSkillsRequired: job.skills.length,
      matchedRequirements: 0,
      totalRequirements: job.requirements.length,
      locationMatch: false,
      jobTypeMatch: false
    };
    
    // Match skills
    const talentSkills = talentProfile.skills || [];
    const jobSkills = job.skills || [];
    
    matchScore.matchedSkills = talentSkills.filter((skill: string) => 
      jobSkills.some((jobSkill: string) => 
        jobSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    // Calculate skill match percentage
    const skillMatchPercentage = jobSkills.length > 0 
      ? (matchScore.matchedSkills.length / jobSkills.length) * 100 
      : 0;
    
    // Match requirements
    const jobRequirements = job.requirements || [];
    // This is a simplified matching - in a real system, you'd have more sophisticated matching
    matchScore.matchedRequirements = jobRequirements.length > 0 ? 1 : 0;
    
    // Location match
    matchScore.locationMatch = talentProfile.preferred_locations 
      ? talentProfile.preferred_locations.some((loc: string) => 
          loc.toLowerCase() === job.location.toLowerCase() || 
          job.remote === true
        )
      : false;
    
    // Job type match
    matchScore.jobTypeMatch = talentProfile.preferred_job_types
      ? talentProfile.preferred_job_types.some((type: string) => 
          type.toLowerCase() === job.job_type.toLowerCase()
        )
      : false;
    
    // Calculate overall score (weighted)
    // Skills are 50% of score, location 25%, job type 25%
    matchScore.score = (
      (skillMatchPercentage * 0.5) + 
      (matchScore.locationMatch ? 25 : 0) + 
      (matchScore.jobTypeMatch ? 25 : 0)
    );
    
    return matchScore;
  } catch (error) {
    console.error('Error calculating job match score:', error);
    return null;
  }
}

/**
 * Find matching jobs for a talent
 * @param talentId User ID of the talent
 * @param limit Maximum number of matches to return
 * @param minScore Minimum match score (0-100)
 * @returns Array of jobs with match scores or null if matching failed
 */
export async function findMatchingJobsForTalent(
  talentId: string,
  limit: number = 10,
  minScore: number = 50
): Promise<any[] | null> {
  try {
    // Get active jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active');
    
    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      return null;
    }
    
    // Get already applied jobs
    const { data: appliedJobs, error: appliedError } = await supabase
      .from('job_applications')
      .select('job_id')
      .eq('user_id', talentId);
    
    if (appliedError) {
      console.error('Error fetching applied jobs:', appliedError);
      return null;
    }
    
    const appliedJobIds = appliedJobs.map((app: any) => app.job_id);
    
    // Filter out already applied jobs
    const availableJobs = jobs.filter((job: any) => !appliedJobIds.includes(job.id));
    
    // Calculate match scores for all available jobs
    const matchPromises = availableJobs.map((job: any) => 
      calculateJobMatchScore(talentId, job.id)
    );
    
    const matchResults = await Promise.all(matchPromises);
    
    // Filter out null results and jobs below minimum score
    const validMatches = matchResults
      .filter((match: any) => match !== null && match.score >= minScore)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit);
    
    // Combine job details with match scores
    const matchedJobs = validMatches.map((match: any) => {
      const job = availableJobs.find((j: any) => j.id === match.jobId);
      return {
        ...job,
        matchScore: match
      };
    });
    
    return matchedJobs;
  } catch (error) {
    console.error('Error finding matching jobs:', error);
    return null;
  }
}

/**
 * Find matching talents for a job
 * @param jobId Job ID to find matches for
 * @param limit Maximum number of matches to return
 * @param minScore Minimum match score (0-100)
 * @returns Array of talent profiles with match scores or null if matching failed
 */
export async function findMatchingTalentsForJob(
  jobId: string,
  limit: number = 10,
  minScore: number = 50
): Promise<any[] | null> {
  try {
    // Get all talent profiles
    const { data: talents, error: talentsError } = await supabase
      .from('talent_profiles')
      .select('*, users!inner(id, name, email)');
    
    if (talentsError) {
      console.error('Error fetching talents:', talentsError);
      return null;
    }
    
    // Get already applied talents
    const { data: applications, error: applicationsError } = await supabase
      .from('job_applications')
      .select('user_id')
      .eq('job_id', jobId);
    
    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      return null;
    }
    
    const appliedTalentIds = applications.map((app: any) => app.user_id);
    
    // Filter out talents who already applied
    const availableTalents = talents.filter((talent: any) => 
      !appliedTalentIds.includes(talent.user_id)
    );
    
    // Calculate match scores for all available talents
    const matchPromises = availableTalents.map((talent: any) => 
      calculateJobMatchScore(talent.user_id, jobId)
    );
    
    const matchResults = await Promise.all(matchPromises);
    
    // Filter out null results and talents below minimum score
    const validMatches = matchResults
      .filter((match: any) => match !== null && match.score >= minScore)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit);
    
    // Combine talent details with match scores
    const matchedTalents = validMatches.map((match: any) => {
      const talent = availableTalents.find((t: any) => t.user_id === match.jobId);
      return {
        ...talent,
        matchScore: match
      };
    });
    
    return matchedTalents;
  } catch (error) {
    console.error('Error finding matching talents:', error);
    return null;
  }
}
