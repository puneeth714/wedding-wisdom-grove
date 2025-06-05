
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const notifications = [
  {
    id: 1,
    type: 'booking',
    title: 'New Booking Assignment',
    message: 'You have been assigned to a new booking for tomorrow.',
    time: '2 hours ago',
    read: false,
    icon: <Bell className="h-4 w-4" />
  },
  {
    id: 2,
    type: 'task',
    title: 'Task Completed',
    message: 'Your venue setup task has been marked as completed.',
    time: '4 hours ago',
    read: false,
    icon: <CheckCircle className="h-4 w-4" />
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Upcoming Event Reminder',
    message: 'You have an event starting in 1 hour.',
    time: '1 day ago',
    read: true,
    icon: <Clock className="h-4 w-4" />
  },
  {
    id: 4,
    type: 'alert',
    title: 'Important Update',
    message: 'New safety protocols have been added to the handbook.',
    time: '2 days ago',
    read: true,
    icon: <AlertTriangle className="h-4 w-4" />
  }
];

const getNotificationTypeColor = (type: string) => {
  switch (type) {
    case 'booking':
      return 'bg-blue-100 text-blue-800';
    case 'task':
      return 'bg-green-100 text-green-800';
    case 'reminder':
      return 'bg-yellow-100 text-yellow-800';
    case 'alert':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const StaffNotifications: React.FC = () => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your latest activities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {unreadCount} unread
          </Badge>
          <Button variant="outline" size="sm">
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`${!notification.read ? 'border-l-4 border-l-sanskara-red' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-sanskara-red rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Mark as read
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              You're all caught up! New notifications will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffNotifications;
