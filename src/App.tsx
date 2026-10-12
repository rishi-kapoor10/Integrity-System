import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

import { OverviewPage } from './pages/Overview';
import { OpportunityRadarPage } from './pages/OpportunityRadar';
import { ClaimIntelligencePage } from './pages/ClaimIntelligence';
import { SolutionLabPage } from './pages/SolutionLab';
import { PilotPortfolioPage } from './pages/PilotPortfolio';
import { ValueRealizationPage } from './pages/ValueRealization';
import { AIGovernancePage } from './pages/AIGovernance';
import { ExecutiveBriefingPage } from './pages/ExecutiveBriefing';
import { SettingsPage } from './pages/Settings';

export function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/opportunities" element={<OpportunityRadarPage />} />
            <Route path="/claims" element={<ClaimIntelligencePage />} />
            <Route path="/solutions" element={<SolutionLabPage />} />
            <Route path="/pilots" element={<PilotPortfolioPage />} />
            <Route path="/value" element={<ValueRealizationPage />} />
            <Route path="/governance" element={<AIGovernancePage />} />
            <Route path="/briefing" element={<ExecutiveBriefingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
