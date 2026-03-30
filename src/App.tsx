import { Routes, Route, Navigate } from 'react-router-dom'
import { useConvexAuth } from 'convex/react'
import { SignIn } from '@clerk/clerk-react'
import Layout from './components/layout/Layout'

import WarbandListPage from './app/warbands/WarbandListPage'
import WarbandDetailPage from './app/warbands/WarbandDetailsPage'
import SessionListPage from './app/sessions/SessionListPage'
import SessionPage from './app/sessions/SessionPage'
import CombatPage from './app/sessions/CombatPage'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <img
          src="/goblin-loading.gif"
          alt="Loading..."
          className="h-32 w-32 object-contain"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <SignIn />
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AuthGate>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/warbands" replace />} />
          <Route path="/warbands" element={<WarbandListPage />} />
          <Route path="/warbands/:warbandId" element={<WarbandDetailPage />} />
          <Route path="/sessions" element={<SessionListPage />} />
          <Route path="/sessions/:sessionId" element={<SessionPage />} />
          <Route path="/sessions/:sessionId/combat" element={<CombatPage />} />
        </Routes>
      </Layout>
    </AuthGate>
  )
}
