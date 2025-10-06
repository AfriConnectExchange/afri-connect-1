'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Trash2,
  LogOut,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Separator } from './separator';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'destructive' | 'warning' | 'info';
  icon?: ReactNode;
  details?: string[];
  consequences?: string[];
  isLoading?: boolean;
  loadingText?: string;
}

const typeConfigs = {
  default: {
    icon: HelpCircle,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    confirmVariant: 'default' as const,
    badgeVariant: 'secondary' as const,
    badgeText: 'Confirmation Required',
  },
  destructive: {
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    confirmVariant: 'destructive' as const,
    badgeVariant: 'destructive' as const,
    badgeText: 'Destructive Action',
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
    confirmVariant: 'default' as const,
    badgeVariant: 'outline' as const,
    badgeText: 'Warning',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    confirmVariant: 'default' as const,
    badgeVariant: 'secondary' as const,
    badgeText: 'Information',
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default',
  icon,
  details,
  consequences,
  isLoading = false,
  loadingText = 'Processing...',
}: ConfirmationModalProps) {
  const config = typeConfigs[type];
  const IconComponent = icon ? () => icon : config.icon;

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}
            >
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            </motion.div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
            </div>
          </div>

          <AlertDialogDescription className="text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {(details || consequences) && (
          <div className="space-y-4">
            <Separator />

            {details && (
              <div>
                <h4 className="font-medium text-sm mb-2">Details:</h4>
                <ul className="space-y-1">
                  {details.map((detail, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {consequences && (
              <div>
                <h4 className="font-medium text-sm mb-2 text-amber-600">
                  Consequences:
                </h4>
                <ul className="space-y-1">
                  {consequences.map((consequence, index) => (
                    <li
                      key={index}
                      className="text-sm text-amber-600 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-3 h-3 mt-1 shrink-0" />
                      <span>{consequence}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isLoading} className="w-full sm:w-auto">
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={config.confirmVariant}
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto gap-2"
            >
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              )}
              {isLoading ? loadingText : confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export interface DeleteConfirmationProps {
  itemName: string;
  itemType?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmation({
  itemName,
  itemType = 'item',
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationProps) {
  return (
    <ConfirmationModal
      isOpen={true}
      onClose={onCancel}
      onConfirm={onConfirm}
      type="destructive"
      title={`Delete ${itemType}`}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmText="Delete"
      consequences={[
        'This action is permanent and cannot be undone',
        'All associated data will be lost',
      ]}
      isLoading={isLoading}
      loadingText="Deleting..."
      icon={<Trash2 className="w-6 h-6" />}
    />
  );
}

export interface PaymentConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    amount: string;
    method: string;
    recipient?: string;
    isLoading?: boolean;
}

export function PaymentConfirmation({ isOpen, onClose, onConfirm, amount, method, recipient, isLoading=false }: PaymentConfirmationProps) {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            type="warning"
            title="Confirm Payment"
            description={`Please confirm your payment of ${amount} using ${method}${recipient ? ` to ${recipient}` : ''}.`}
            confirmText="Confirm Payment"
            details={[
                `Amount: ${amount}`,
                `Payment method: ${method}`,
                ...(recipient ? [`Recipient: ${recipient}`] : []),
                'Transaction fees may apply'
            ]}
            consequences={[
                'This payment will be processed immediately',
                'Transaction fees are non-refundable'
            ]}
            isLoading={isLoading}
            loadingText="Processing payment..."
            icon={<CheckCircle className="w-6 h-6" />}
        />
    );
}

export interface AccountDeletionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function AccountDeletionConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: AccountDeletionConfirmationProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="destructive"
      title="Delete Account"
      description="Are you absolutely sure you want to permanently delete your account? This action cannot be undone and all your data will be lost."
      confirmText="Delete Account Permanently"
      consequences={[
        'All your personal data will be permanently deleted',
        'All your orders and transaction history will be lost',
        'Any active listings or courses will be removed',
        'You will not be able to recover this account',
      ]}
      isLoading={isLoading}
      loadingText="Deleting account..."
      icon={<Trash2 className="w-6 h-6" />}
    />
  );
}
