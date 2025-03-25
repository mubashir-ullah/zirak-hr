import supabase from './supabase';
import { findUserById } from './supabaseDb';

export interface Notification {
  id?: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  action_url?: string;
  created_at?: string;
}

export type NotificationType = 
  | 'application_status_change'
  | 'new_application'
  | 'job_match'
  | 'profile_update'
  | 'new_message'
  | 'system';

/**
 * Create a new notification for a user
 * @param userId User ID to send notification to
 * @param title Notification title
 * @param message Notification message
 * @param type Notification type
 * @param actionUrl Optional URL to navigate to when notification is clicked
 * @returns Created notification or null if creation failed
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  actionUrl?: string
): Promise<Notification | null> {
  try {
    // Check if user exists
    const user = await findUserById(userId);
    
    if (!user) {
      console.error('User not found for notification:', userId);
      return null;
    }
    
    const notification: Notification = {
      user_id: userId,
      title,
      message,
      type,
      read: false,
      action_url: actionUrl,
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
    console.error('Error in createNotification:', error);
    return null;
  }
}

/**
 * Get notifications for a user
 * @param userId User ID to get notifications for
 * @param limit Maximum number of notifications to return
 * @param offset Offset for pagination
 * @param unreadOnly Whether to only return unread notifications
 * @returns Array of notifications or null if retrieval failed
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 10,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<{ notifications: Notification[], count: number } | null> {
  try {
    // Build query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (unreadOnly) {
      query = query.eq('read', false);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return null;
    }
    
    return {
      notifications: data,
      count: count || 0
    };
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    return null;
  }
}

/**
 * Mark a notification as read
 * @param notificationId Notification ID to mark as read
 * @param userId User ID who owns the notification
 * @returns Updated notification or null if update failed
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<Notification | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId) // Ensure user owns the notification
      .select()
      .single();
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return null;
  }
}

/**
 * Mark all notifications as read for a user
 * @param userId User ID to mark all notifications as read for
 * @returns Number of notifications marked as read or null if update failed
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select();
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return null;
    }
    
    return data.length;
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return null;
  }
}

/**
 * Delete a notification
 * @param notificationId Notification ID to delete
 * @param userId User ID who owns the notification
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId); // Ensure user owns the notification
    
    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return false;
  }
}

/**
 * Create a notification for job application status change
 * @param applicationId Job application ID
 * @param newStatus New application status
 * @returns Created notification or null if creation failed
 */
export async function notifyApplicationStatusChange(
  applicationId: string,
  newStatus: string
): Promise<Notification | null> {
  try {
    // Get application details with job and user info
    const { data: application, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner(id, title, company),
        users!inner(id)
      `)
      .eq('id', applicationId)
      .single();
    
    if (error) {
      console.error('Error fetching application for notification:', error);
      return null;
    }
    
    // Format status for display
    const statusFormatted = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    
    // Create notification
    return await createNotification(
      application.user_id,
      'Application Status Updated',
      `Your application for ${application.jobs.title} at ${application.jobs.company} has been updated to: ${statusFormatted}`,
      'application_status_change',
      `/talent/applications/${applicationId}`
    );
  } catch (error) {
    console.error('Error in notifyApplicationStatusChange:', error);
    return null;
  }
}

/**
 * Create a notification for a new job application
 * @param applicationId Job application ID
 * @returns Created notification or null if creation failed
 */
export async function notifyNewApplication(
  applicationId: string
): Promise<Notification | null> {
  try {
    // Get application details with job and user info
    const { data: application, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner(id, title, company, posted_by),
        users!inner(id, name)
      `)
      .eq('id', applicationId)
      .single();
    
    if (error) {
      console.error('Error fetching application for notification:', error);
      return null;
    }
    
    // Create notification for hiring manager
    return await createNotification(
      application.jobs.posted_by,
      'New Job Application',
      `${application.users.name} has applied for the ${application.jobs.title} position`,
      'new_application',
      `/hiring/applications?jobId=${application.job_id}`
    );
  } catch (error) {
    console.error('Error in notifyNewApplication:', error);
    return null;
  }
}
