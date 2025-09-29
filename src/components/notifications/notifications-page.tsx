'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, Check, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { NotificationSettings } from './notification-settings';
import { NotificationItem, type Notification } from './notification-item';
import { EmptyState } from './empty-state';
import { PageLoader } from '../ui/loader';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/notifications/list');
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [toast]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    const matchesTab = activeTab === 'all' || notification.type === activeTab;
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const groupNotificationsByTime = (notifications: Notification[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const groups: {
      Today: Notification[];
      'This Week': Notification[];
      Earlier: Notification[];
    } = {
      Today: [],
      'This Week': [],
      Earlier: [],
    };

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.timestamp);
      if (notificationDate >= today) {
        groups.Today.push(notification);
      } else if (notificationDate >= startOfWeek) {
        groups['This Week'].push(notification);
      } else {
        groups.Earlier.push(notification);
      }
    });

    return groups;
  };

  const groupedNotifications = groupNotificationsByTime(filteredNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({
      title: 'All Read',
      description: 'All notifications have been marked as read.',
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast({
      title: 'Deleted',
      description: 'Notification has been deleted.',
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: 'Cleared',
      description: 'All notifications have been cleared.',
    });
  };

  return (
    <>
      <div className="border-b border-border bg-card sticky top-[69px] z-10">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Bell className="w-8 h-8 text-primary" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 text-xs min-w-[20px] h-5 flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  Notifications
                </h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0
                    ? `${unreadCount} unread messages`
                    : 'You are all caught up!'}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                >
                  <Check className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Mark All Read</span>
                </Button>
              )}
              <Button
                onClick={() => setShowSettings(true)}
                variant="ghost"
                size="icon"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
            className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear All
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div
              className="w-full overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <TabsList className="inline-flex w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="order">Orders</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                <TabsTrigger value="promotion">Offers</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <PageLoader />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <EmptyState searchQuery={searchQuery} activeTab={activeTab} />
              ) : (
                <AnimatePresence>
                  {Object.entries(groupedNotifications).map(
                    ([group, notificationsInGroup]) =>
                      notificationsInGroup.length > 0 && (
                        <motion.div
                          key={group}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mb-8"
                        >
                          <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-3">
                            {group}
                          </h3>
                          <div className="border rounded-lg overflow-hidden">
                            {notificationsInGroup.map(
                              (notification, index) => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  index={index}
                                  isLast={
                                    index === notificationsInGroup.length - 1
                                  }
                                  onMarkAsRead={markAsRead}
                                  onDelete={deleteNotification}
                                />
                              )
                            )}
                          </div>
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <NotificationSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={() => {
          toast({
            title: 'Settings Saved',
            description: 'Your notification preferences have been updated.',
          });
          setShowSettings(false);
        }}
      />
    </>
  );
}
