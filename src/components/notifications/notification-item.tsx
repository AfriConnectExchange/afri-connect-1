'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Package, TrendingUp, User, AlertCircle, CheckCircle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: 'high' | 'medium' | 'low';
}

const icons = {
    order: Package,
    delivery: CheckCircle,
    promotion: TrendingUp,
    system: User,
    default: AlertCircle
}

interface NotificationItemProps {
  notification: Notification;
  index: number;
  isLast: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  index,
  isLast,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const Icon = icons[notification.type] || icons.default;

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'delivery':
        return { bg: 'bg-emerald-100', text: 'text-emerald-600' };
      case 'promotion':
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'system':
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const typeStyles = getTypeStyles(notification.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative flex items-start gap-4 p-4 transition-colors duration-200 cursor-pointer ${
        !notification.read ? 'bg-primary/5' : 'bg-transparent'
      } ${!isLast ? 'border-b' : ''} hover:bg-muted/50`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
      )}

      <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-1">
        <div
          className={`w-2 h-2 rounded-full ${getPriorityColor(
            notification.priority
          )}`}
        ></div>
      </div>

      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${typeStyles.bg}`}
      >
        <Icon className={`w-5 h-5 ${typeStyles.text}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3
            className={`font-semibold text-sm ${
              !notification.read ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {notification.title}
          </h3>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimestamp(notification.timestamp)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {notification.message}
        </p>

        {notification.action && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              notification.action!.onClick();
            }}
            size="sm"
            variant="secondary"
            className="h-8"
          >
            {notification.action.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
