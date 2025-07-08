import React from 'react';

const PracticePageMinimal: React.FC = () => {
  console.log('🔥 PracticePageMinimal is rendering!');
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Practice Page - Minimal Version</h1>
      <p>This is a minimal version to test if the routing works.</p>
      <div className="mt-4">
        <p>If you can see this, the routing is working and the issue is in the main PracticePage component.</p>
      </div>
    </div>
  );
};

export default PracticePageMinimal;
