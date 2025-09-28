import React from 'react';
import { Loader2, Video } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Video className="w-12 h-12 text-primary mr-3" />
          <h1 className="text-3xl font-bold">VideoAI</h1>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        
        <p className="text-muted-foreground">
          Loading your account...
        </p>
      </div>
    </div>
  );
};
