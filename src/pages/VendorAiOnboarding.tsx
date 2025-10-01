import React from 'react';
import { useNavigate } from 'react-router-dom';
import AiOnboardingChat from '@/components/onboarding/AiOnboardingChat';

const VendorAiOnboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleOnboardingComplete = (mergedData: any) => {
    // Navigate to manual form with pre-filled data
    navigate('/manual-vendor-onboarding', { 
      state: { prefilledData: mergedData } 
    });
  };

  return (
    <AiOnboardingChat
      userType="vendor"
      onOnboardingComplete={handleOnboardingComplete}
      websocketUrl="ws://localhost:8000/onboarding/onboard"
      uploadEndpoint="http://localhost:8000/api/vendor_onboarding/upload-and-extract"
    />
  );
};

export default VendorAiOnboarding;
