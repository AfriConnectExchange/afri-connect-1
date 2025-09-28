'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import zxcvbn from 'zxcvbn';
import { CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '../ui/progress';

interface PasswordStrengthProps {
  password?: string;
}

const requirements = [
  { id: 'length', text: 'At least 8 characters long', regex: /.{8,}/ },
  { id: 'lowercase', text: 'Contains a lowercase letter', regex: /[a-z]/ },
  { id: 'uppercase', text: 'Contains an uppercase letter', regex: /[A-Z]/ },
  { id: 'number', text: 'Contains a number', regex: /[0-9]/ },
  { id: 'special', text: 'Contains a special character', regex: /[^A-Za-z0-9]/ },
];

const strengthColors = [
  'bg-destructive',
  'bg-destructive',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
];

const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  const [strength, setStrength] = useState({ score: 0, feedback: '' });
  const [metRequirements, setMetRequirements] = useState<string[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (password) {
      setShow(true);
      const result = zxcvbn(password);
      setStrength({
        score: result.score,
        feedback: result.feedback?.warning || '',
      });

      const newMet = requirements
        .filter((req) => req.regex.test(password))
        .map((req) => req.id);
      setMetRequirements(newMet);
    } else {
      setShow(false);
    }
  }, [password]);

  if (!show) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Progress value={(strength.score + 1) * 20} className={`h-2 ${strengthColors[strength.score]}`} />
              <span className="text-xs font-medium w-20 text-right">{strengthLabels[strength.score]}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              {requirements.map((req) => {
                const isMet = metRequirements.includes(req.id);
                return (
                  <div key={req.id} className="flex items-center gap-2 text-xs">
                    {isMet ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span className={isMet ? 'text-foreground' : 'text-muted-foreground'}>
                      {req.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {strength.feedback && (
                <p className="text-xs text-amber-600 mt-2">{strength.feedback}</p>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
