import React from 'react';
import { SpectatorMode } from '@/components/spectate/SpectatorMode';

const SpectatePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SpectatorMode />
    </div>
  );
};

export default SpectatePage;
