import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CallProvider } from './context/CallContext'
import { Header } from './components/Layout/Header'
import { ProtectedRoute } from './components/Layout/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { Home } from './pages/Home'
import { CallPage } from './pages/CallPage'
import { DashboardPage } from './pages/DashboardPage'
import { BranchingScreen } from './components/Call/BranchingScreen'
import { PostCallCapture } from './components/Call/PostCallCapture'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CallProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/call/:callId"
                element={
                  <ProtectedRoute>
                    <CallPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/call/:callId/branch"
                element={
                  <ProtectedRoute>
                    <BranchingScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/call/:callId/capture"
                element={
                  <ProtectedRoute>
                    <PostCallCapture />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </CallProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
