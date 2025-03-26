import supabase from '@/lib/supabase';

export interface SkillData {
  id: string;
  name: string;
  category: string;
  demand_score: number;
  growth_rate: number;
  competition_level: number;
  avg_salary: number;
  job_count: number;
  created_at?: string;
  updated_at?: string;
}

class SkillAnalytics {
  static async getTrendingSkills(limit: number = 10): Promise<SkillData[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('demand_score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching trending skills:', error);
      throw error;
    }
    
    return data || [];
  }
  
  static async getFastestGrowingSkills(limit: number = 10): Promise<SkillData[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('growth_rate', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching fastest growing skills:', error);
      throw error;
    }
    
    return data || [];
  }
  
  static async getLowCompetitionSkills(limit: number = 10): Promise<SkillData[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('demand_score', { ascending: false })
      .order('competition_level', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching low competition skills:', error);
      throw error;
    }
    
    return data || [];
  }
  
  static async getSkillsByCategory(category: string, limit: number = 10): Promise<SkillData[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('category', category)
      .order('demand_score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error(`Error fetching skills for category ${category}:`, error);
      throw error;
    }
    
    return data || [];
  }
  
  static async getSkillById(skillId: string): Promise<SkillData | null> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();
    
    if (error) {
      console.error(`Error fetching skill with ID ${skillId}:`, error);
      throw error;
    }
    
    return data;
  }
  
  static async getSkillsByIds(skillIds: string[]): Promise<SkillData[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .in('id', skillIds);
    
    if (error) {
      console.error('Error fetching skills by IDs:', error);
      throw error;
    }
    
    return data || [];
  }
  
  static async getSkillCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('category')
      .order('category');
    
    if (error) {
      console.error('Error fetching skill categories:', error);
      throw error;
    }
    
    // Extract unique categories
    const categories = [...new Set(data?.map(item => item.category))];
    return categories;
  }
  
  static async searchSkills(query: string, limit: number = 10): Promise<SkillData[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('demand_score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error(`Error searching skills with query "${query}":`, error);
      throw error;
    }
    
    return data || [];
  }
  
  static async getSkillSummaryStatistics(): Promise<{
    totalSkills: number;
    topCategories: { category: string; count: number }[];
    avgDemandScore: number;
    avgGrowthRate: number;
  }> {
    // Get total skills count
    const { count: totalSkills, error: countError } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting total skills count:', countError);
      throw countError;
    }
    
    // Get all skills for calculating averages
    const { data: allSkills, error: skillsError } = await supabase
      .from('skills')
      .select('demand_score, growth_rate, category');
    
    if (skillsError) {
      console.error('Error getting skills data for statistics:', skillsError);
      throw skillsError;
    }
    
    // Calculate average demand score and growth rate
    const avgDemandScore = allSkills?.reduce((sum, skill) => sum + skill.demand_score, 0) / (allSkills?.length || 1);
    const avgGrowthRate = allSkills?.reduce((sum, skill) => sum + skill.growth_rate, 0) / (allSkills?.length || 1);
    
    // Count skills by category
    const categoryCount: Record<string, number> = {};
    allSkills?.forEach(skill => {
      categoryCount[skill.category] = (categoryCount[skill.category] || 0) + 1;
    });
    
    // Convert to array and sort by count
    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalSkills: totalSkills || 0,
      topCategories,
      avgDemandScore,
      avgGrowthRate
    };
  }
}

export default SkillAnalytics;
