"use client";
import { useState } from 'react';
import LatestActivities from './LatestActivitiesSection';
import ActivityDetail from './OneLatestActivity';

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState("Latest Activities");
  const [selectedActivity, setSelectedActivity] = useState(false);

  const tabs = [
    "Latest Activities", 
    "Finance", 
    "Maintenance updates", 
    "Partnership Announcements"
  ];

  const handleOpenDetail = () => {
    setSelectedActivity(true);
  };

  const handleBackToList = () => {
    setSelectedActivity(false);
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white md:py-8 py-4 font-manrope">
      <div className="max-w-350 mx-auto px-4 md:px-0">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Learn</h1>
        
        <div className="flex bg-[#1D1D1D] py-6 md:py-12 flex-col md:flex-row gap-8">
          {/* SIDEBAR */}
          <aside className="w-full md:w-100 space-y-1 border-r-4 border-[#181818] shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedActivity(false); // Reset to list view when switching categories
                }}
                className={`w-full text-left px-4 py-3 text-lg transition-all cursor-pointer relative group ${
                  activeTab === tab 
                    ? "text-white font-semibold bg-white/5" 
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/2"
                }`}
              >
                {/* Active indicator line exactly as in your code */}
                {activeTab === tab && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-white" />
                )}
                {tab}
              </button>
            ))}
          </aside>

          {/* DYNAMIC CONTENT AREA */}
          <main className="flex-1">
            {activeTab === "Latest Activities" ? (
              // Toggle between List and Detail
              selectedActivity ? (
                <ActivityDetail onBack={handleBackToList} />
              ) : (
                <LatestActivities onActivityClick={handleOpenDetail} />
              )
            ) : (
              <div className="rounded-lg p-20 text-center border border-white/5">
                <p className="text-gray-500 italic">
                  Content for <span className="text-blue-400">"{activeTab}"</span> is coming soon.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}