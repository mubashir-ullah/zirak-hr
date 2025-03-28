import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  countUnreadNotifications
} from '@/lib/database';

// GET endpoint to retrieve user notifications
export async function GET(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    // Get notifications using our database function
    const result = await getUserNotifications(
      session.user.id,
      {
        limit,
        page,
        unreadOnly
      }
    );
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
    
    return NextResponse.json({
      notifications: result.data,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit)
      },
      unreadCount: result.unreadCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    return NextResponse.json({ error: 'Failed to retrieve notifications' }, { status: 500 });
  }
}

// PATCH endpoint to mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request data
    const data = await request.json();
    const { notificationId, markAll } = data;
    
    if (markAll) {
      // Mark all notifications as read
      const result = await markAllNotificationsAsRead(session.user.id);
      
      if (result === null) {
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        message: `Marked ${result.count} notifications as read`,
        unreadCount: 0
      }, { status: 200 });
    } else if (notificationId) {
      // Mark single notification as read
      const notification = await markNotificationAsRead(notificationId, session.user.id);
      
      if (!notification) {
        return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
      }
      
      // Get updated unread count
      const unreadCount = await countUnreadNotifications(session.user.id);
      
      return NextResponse.json({ 
        message: 'Notification marked as read',
        notification,
        unreadCount
      }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Missing notificationId or markAll parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

// DELETE endpoint to delete a notification
export async function DELETE(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get notification ID from query parameters
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    
    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }
    
    // Delete notification
    const success = await deleteNotification(notificationId, session.user.id);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }
    
    // Get updated unread count
    const unreadCount = await countUnreadNotifications(session.user.id);
    
    return NextResponse.json({ 
      message: 'Notification deleted successfully',
      unreadCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
