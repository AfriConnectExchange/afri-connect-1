'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

export function NotificationSettings({
  isOpen,
  onClose,
  onSave,
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    inApp: true,
    email: true,
    sms: false,
    orderUpdates: true,
    deliveryAlerts: true,
    promotions: true,
    systemAlerts: true,
  });

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Configure how and when you receive notifications.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          <div>
            <h3 className="font-semibold mb-4 text-foreground">
              Delivery Channels
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="inApp" className="font-medium">
                    In-App Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications within the app
                  </p>
                </div>
                <Switch
                  id="inApp"
                  checked={settings.inApp}
                  onCheckedChange={(checked) =>
                    handleSettingChange('inApp', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="email" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email"
                  checked={settings.email}
                  onCheckedChange={(checked) =>
                    handleSettingChange('email', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="sms" className="font-medium">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via SMS
                  </p>
                </div>
                <Switch
                  id="sms"
                  checked={settings.sms}
                  onCheckedChange={(checked) =>
                    handleSettingChange('sms', checked)
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">
              Notification Types
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="orderUpdates" className="font-medium">
                    Order Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Order confirmations, shipping updates
                  </p>
                </div>
                <Switch
                  id="orderUpdates"
                  checked={settings.orderUpdates}
                  onCheckedChange={(checked) =>
                    handleSettingChange('orderUpdates', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="deliveryAlerts" className="font-medium">
                    Delivery Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Delivery attempts, confirmations
                  </p>
                </div>
                <Switch
                  id="deliveryAlerts"
                  checked={settings.deliveryAlerts}
                  onCheckedChange={(checked) =>
                    handleSettingChange('deliveryAlerts', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="promotions" className="font-medium">
                    Promotional Offers
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Special offers, discounts, campaigns
                  </p>
                </div>
                <Switch
                  id="promotions"
                  checked={settings.promotions}
                  onCheckedChange={(checked) =>
                    handleSettingChange('promotions', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="systemAlerts" className="font-medium">
                    System Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Account updates, security alerts
                  </p>
                </div>
                <Switch
                  id="systemAlerts"
                  checked={settings.systemAlerts}
                  onCheckedChange={(checked) =>
                    handleSettingChange('systemAlerts', checked)
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
