/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layout } from './components/Layout';
import { ClientView } from './views/ClientView';
import { TrainerView } from './views/TrainerView';
import { AdminView } from './views/AdminView';
import { LoginView } from './views/LoginView';
import { CouchLandingView } from './views/CouchLandingView';
import { AthleteLandingView } from './views/AthleteLandingView';
import { useStore } from './store';

export default function App() {
  const { isLoggedIn, currentRole } = useStore();

  const cleanPath = typeof window !== 'undefined'
    ? window.location.pathname.replace(/\/+$/, '').toLowerCase()
    : '';
  const cleanHash = typeof window !== 'undefined'
    ? window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '').toLowerCase()
    : '';

  const isCouchPath =
    cleanPath === '/couch' ||
    cleanPath === '/coach' ||
    cleanHash === 'couch' ||
    cleanHash === 'coach';

  const isAthletePath =
    cleanPath === '/atleta' ||
    cleanPath === '/athlete' ||
    cleanHash === 'atleta' ||
    cleanHash === 'athlete';

  if (isCouchPath) {
    return <CouchLandingView />;
  }

  if (isAthletePath) {
    return <AthleteLandingView />;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-[100dvh] w-full max-w-full sm:max-w-md mx-auto bg-[var(--color-bg-base)] overflow-hidden relative">
        <LoginView />
      </div>
    );
  }

  return (
    <Layout>
      {(activeTab, setActiveTab) => (
        <>
          {currentRole === 'cliente' && <ClientView tab={activeTab} onNavigateTab={setActiveTab} />}
          {currentRole === 'entrenador' && <TrainerView tab={activeTab} onNavigateTab={setActiveTab} />}
          {currentRole === 'admin' && <AdminView tab={activeTab} />}
        </>
      )}
    </Layout>
  );
}

