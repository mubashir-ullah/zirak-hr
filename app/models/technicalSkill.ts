import supabase from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface TechnicalSkillData {
  id: string;
  name: string;
  category: string;
  description?: string;
  popularity_score?: number;
  created_at?: string;
  updated_at?: string;
}

class TechnicalSkill {
  static async getAllSkills(): Promise<TechnicalSkillData[]> {
    const { data, error } = await supabase
      .from('technical_skills')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching all technical skills:', error);
      throw error;
    }
    
    return data || [];
  }
  
  static async getSkillsByCategory(category: string): Promise<TechnicalSkillData[]> {
    const { data, error } = await supabase
      .from('technical_skills')
      .select('*')
      .eq('category', category)
      .order('name');
    
    if (error) {
      console.error(`Error fetching technical skills for category ${category}:`, error);
      throw error;
    }
    
    return data || [];
  }
  
  static async getSkillById(id: string): Promise<TechnicalSkillData | null> {
    const { data, error } = await supabase
      .from('technical_skills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching technical skill with ID ${id}:`, error);
      throw error;
    }
    
    return data;
  }
  
  static async createSkill(skillData: Omit<TechnicalSkillData, 'id' | 'created_at' | 'updated_at'>): Promise<TechnicalSkillData> {
    const newSkill = {
      id: uuidv4(),
      ...skillData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('technical_skills')
      .insert([newSkill])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating technical skill:', error);
      throw error;
    }
    
    return data;
  }
  
  static async updateSkill(id: string, skillData: Partial<TechnicalSkillData>): Promise<TechnicalSkillData> {
    const updateData = {
      ...skillData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('technical_skills')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating technical skill with ID ${id}:`, error);
      throw error;
    }
    
    return data;
  }
  
  static async deleteSkill(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('technical_skills')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting technical skill with ID ${id}:`, error);
      throw error;
    }
    
    return true;
  }
  
  static async searchSkills(query: string): Promise<TechnicalSkillData[]> {
    const { data, error } = await supabase
      .from('technical_skills')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');
    
    if (error) {
      console.error(`Error searching technical skills with query "${query}":`, error);
      throw error;
    }
    
    return data || [];
  }
  
  static async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('technical_skills')
      .select('category')
      .order('category');
    
    if (error) {
      console.error('Error fetching technical skill categories:', error);
      throw error;
    }
    
    // Extract unique categories
    const categories = [...new Set(data?.map(item => item.category))];
    return categories;
  }
}

export default TechnicalSkill;
