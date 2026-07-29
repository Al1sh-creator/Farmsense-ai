import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Suggestions from './pages/Suggestions'
import CropComparison from './pages/CropComparison'
import FarmProfile from './pages/FarmProfile'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public */}
            <Route path="/"          element={<Landing />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />

            {/* Protected */}
            <Route path="/onboarding"      element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/alerts"          element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/suggestions"     element={<ProtectedRoute><Suggestions /></ProtectedRoute>} />
            <Route path="/crop-comparison" element={<ProtectedRoute><CropComparison /></ProtectedRoute>} />
            <Route path="/farm-profile"    element={<ProtectedRoute><FarmProfile /></ProtectedRoute>} />
            <Route path="/settings"        element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
