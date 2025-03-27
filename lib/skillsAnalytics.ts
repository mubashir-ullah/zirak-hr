import supabase from './supabase';

export interface SkillAnalyticsData {
  id?: string;
  skill_name: string;
  demand_score: number;
  growth_rate: number;
  competition_level: number;
  category: string;
  average_salary: number;
  job_count: number;
  updated_at?: string;
}

export interface SkillComparisonData {
  skill_name: string;
  demand_score: number;
  growth_rate: number;
  competition_level: number;
  job_count: number;
  average_salary: number;
}

export interface SkillSummaryStatistics {
  total_skills: number;
  top_categories: { category: string; count: number }[];
  average_demand_score: number;
  highest_demand_skills: { skill_name: string; demand_score: number }[];
  fastest_growing_skills: { skill_name: string; growth_rate: number }[];
}

/**
 * Get trending skills based on demand score
 */
export async function getTrendingSkills(limit: number = 10): Promise<SkillAnalyticsData[]> {
  try {
    const { data, error } = await supabase
      .from('skill_analytics')
      .select('*')
      .order('demand_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trending skills:', error);
    return [];
  }
}

/**
 * Get fastest growing skills
 */
export async function getFastestGrowingSkills(limit: number = 10): Promise<SkillAnalyticsData[]> {
  try {
    const { data, error } = await supabase
      .from('skill_analytics')
      .select('*')
      .order('growth_rate', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching fastest growing skills:', error);
    return [];
  }
}

/**
 * Get skills with high demand but low competition
 */
export async function getLowCompetitionSkills(limit: number = 10): Promise<SkillAnalyticsData[]> {
  try {
    const { data, error } = await supabase
      .from('skill_analytics')
      .select('*')
      .order('demand_score', { ascending: false })
      .order('competition_level', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching low competition skills:', error);
    return [];
  }
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(category: string, limit: number = 10): Promise<SkillAnalyticsData[]> {
  try {
    const { data, error } = await supabase
      .from('skill_analytics')
      .select('*')
      .eq('category', category)
      .order('demand_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching skills for category ${category}:`, error);
    return [];
  }
}

/**
 * Get summary statistics for skills
 */
export async function getSummaryStatistics(): Promise<SkillSummaryStatistics> {
  try {
    // Get total skills count
    const { count: totalSkills, error: countError } = await supabase
      .from('skill_analytics')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    // Get top categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('skill_analytics')
      .select('category')
      .order('category');
    
    if (categoriesError) throw categoriesError;
    
    // Count occurrences of each category
    const categoryCounts: Record<string, number> = {};
    categoriesData?.forEach(item => {
      const category = item.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Convert to array and sort
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Get average demand score
    const { data: demandData, error: demandError } = await supabase
      .from('skill_analytics')
      .select('demand_score');
    
    if (demandError) throw demandError;
    
    const totalDemand = demandData?.reduce((sum, item) => sum + item.demand_score, 0) || 0;
    const averageDemandScore = totalDemand / (demandData?.length || 1);
    
    // Get highest demand skills
    const { data: highestDemandSkills, error: highestDemandError } = await supabase
      .from('skill_analytics')
      .select('skill_name, demand_score')
      .order('demand_score', { ascending: false })
      .limit(5);
    
    if (highestDemandError) throw highestDemandError;
    
    // Get fastest growing skills
    const { data: fastestGrowingSkills, error: fastestGrowingError } = await supabase
      .from('skill_analytics')
      .select('skill_name, growth_rate')
      .order('growth_rate', { ascending: false })
      .limit(5);
    
    if (fastestGrowingError) throw fastestGrowingError;
    
    return {
      total_skills: totalSkills || 0,
      top_categories: topCategories,
      average_demand_score: averageDemandScore,
      highest_demand_skills: highestDemandSkills || [],
      fastest_growing_skills: fastestGrowingSkills || []
    };
  } catch (error) {
    console.error('Error getting summary statistics:', error);
    return {
      total_skills: 0,
      top_categories: [],
      average_demand_score: 0,
      highest_demand_skills: [],
      fastest_growing_skills: []
    };
  }
}

/**
 * Compare skills by demand, growth, and competition
 */
export async function compareSkills(skillNames: string[]): Promise<SkillComparisonData[]> {
  try {
    if (!skillNames.length) return [];
    
    const { data, error } = await supabase
      .from('skill_analytics')
      .select('skill_name, demand_score, growth_rate, competition_level, job_count, average_salary')
      .in('skill_name', skillNames);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error comparing skills:', error);
    return [];
  }
}

/**
 * Get technical skills for a user
 */
export async function getUserTechnicalSkills(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skill_analytics:skill_name(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user technical skills:', error);
    return [];
  }
}

/**
 * Add or update a user's technical skill
 */
export async function updateUserTechnicalSkill(userId: string, skillName: string, proficiency: number, yearsOfExperience: number): Promise<boolean> {
  try {
    // Check if skill already exists for user
    const { data: existingSkill, error: checkError } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_name', skillName)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError; // PGRST116 is "No rows returned" which is fine
    
    if (existingSkill) {
      // Update existing skill
      const { error: updateError } = await supabase
        .from('user_skills')
        .update({
          proficiency,
          years_of_experience: yearsOfExperience,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSkill.id);
      
      if (updateError) throw updateError;
    } else {
      // Insert new skill
      const { error: insertError } = await supabase
        .from('user_skills')
        .insert({
          user_id: userId,
          skill_name: skillName,
          proficiency,
          years_of_experience: yearsOfExperience,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user technical skill:', error);
    return false;
  }
}

/**
 * Delete a user's technical skill
 */
export async function deleteUserTechnicalSkill(userId: string, skillName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', userId)
      .eq('skill_name', skillName);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting user technical skill:', error);
    return false;
  }
}
