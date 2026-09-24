/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType } from './types';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { FpsIosSmoothEngine } from './components/FpsIosSmoothEngine';
import { CpuGpuThermalTuner } from './components/CpuGpuThermalTuner';
import { MagiskBuilder } from './components/MagiskBuilder';
import { RootCompatibility } from './components/RootCompatibility';
import { NetworkTester } from './components/NetworkTester';
import { DesyncSimulator } from './components/DesyncSimulator';
import { BulletRegVisualizer } from './components/BulletRegVisualizer';
import { Footer } from './components/Footer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewDashboard language="english" setTab={setCurrentTab} />;
      case 'fps-ios-smooth':
        return (
          <FpsIosSmoothEngine
            language="english"
            onNavigateToBuilder={() => setCurrentTab('magisk-generator')}
          />
        );
      case 'cpu-gpu-thermal':
        return (
          <CpuGpuThermalTuner
            language="english"
            onNavigateToBuilder={() => setCurrentTab('magisk-generator')}
          />
        );
      case 'magisk-generator':
        return <MagiskBuilder language="english" />;
      case 'root-compatibility':
        return <RootCompatibility language="english" />;
      case 'network-tester':
        return <NetworkTester language="english" />;
      case 'desync-mechanics':
        return <DesyncSimulator language="english" />;
      case 'bullet-registration':
        return <BulletRegVisualizer language="english" />;
      default:
        return <OverviewDashboard language="english" setTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setTab={setCurrentTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveTab()}
      </main>

      {/* Footer */}
      <Footer language="english" />
    </div>
  );
}
