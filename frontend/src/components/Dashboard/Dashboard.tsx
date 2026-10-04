import type { TimerSettings } from '../../features/droobTimer/types';

import { CenterPanel } from './CenterPanel/CenterPanel';

import './Dashboard.css';

type DashboardProps = {
  timerSettings: TimerSettings;
};

export function Dashboard({ timerSettings }: DashboardProps) {
  return (
    <main className="dashboard">
      <CenterPanel timerSettings={timerSettings} />
    </main>
  );
}
