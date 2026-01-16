import React from 'react';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;
