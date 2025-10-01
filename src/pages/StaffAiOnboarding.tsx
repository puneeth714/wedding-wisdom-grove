import React from 'react';
import { useNavigate } from 'react-router-dom';
import AiOnboardingChat from '@/components/onboarding/AiOnboardingChat';

const StaffAiOnboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleOnboardingComplete = (mergedData: any) => {
    // Navigate to manual form with pre-filled data
    navigate('/staff/onboarding', { 
      state: { prefilledData: mergedData } 
    });
  };

  return (
    <AiOnboardingChat
      userType="staff"
      onOnboardingComplete={handleOnboardingComplete}
      websocketUrl="ws://localhost:8000/onboarding/onboard"
      uploadEndpoint="http://localhost:8000/api/vendor_onboarding/upload-and-extract"
    />
  );
};

export default StaffAiOnboarding;
