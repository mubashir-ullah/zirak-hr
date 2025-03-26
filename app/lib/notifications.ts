/**
 * Notifications Module
 * 
 * This file contains functions for creating and managing notifications.
 */

import supabase from './supabase';

/**
 * Create a notification for a user
 * 
 * @param userId - The ID of the user to notify
 * @param title - The notification title
 * @param message - The notification message
 * @param type - The notification type (e.g., 'new_application', 'application_status_change')
 * @param link - Optional link to navigate to when clicking the notification
 * @returns The created notification or null if there was an error
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  link?: string
) {
  try {
    const notification = {
      user_id: userId,
      title,
      message,
      type,
      link,
      read: false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Track job application for analytics
 * 
 * @param jobId - The ID of the job
 * @param userId - The ID of the user
 * @returns True if successful, false otherwise
 */
export async function trackJobApplication(jobId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('job_views')
      .insert({
        job_id: jobId,
        user_id: userId,
        action: 'application',
        viewed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking job application:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error tracking job application:', error);
    return false;
  }
}
