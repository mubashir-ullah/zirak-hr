import React from 'react';
import { Tooltip } from '@/app/components/ui/tooltip';
import { CheckCircle } from 'lucide-react';

interface VerifiedSkillBadgeProps {
  skill: string;
  isVerified: boolean;
  score?: number;
  date?: string;
}

const VerifiedSkillBadge: React.FC<VerifiedSkillBadgeProps> = ({
  skill,
  isVerified,
  score,
  date
}) => {
  const formattedDate = date ? new Date(date).toLocaleDateString() : '';
  const tooltipContent = isVerified 
    ? `Verified on ${formattedDate}${score ? ` with a score of ${score}%` : ''}`
    : 'Take a skill test to verify this skill';

  return (
    <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-800 mr-2 mb-2">
      {skill}
      {isVerified ? (
        <Tooltip content={tooltipContent}>
          <CheckCircle className="ml-1 h-4 w-4 text-blue-500" />
        </Tooltip>
      ) : (
        <Tooltip content={tooltipContent}>
          <span className="ml-1 h-4 w-4 text-gray-400 cursor-pointer">•</span>
        </Tooltip>
      )}
    </div>
  );
};

export default VerifiedSkillBadge;
