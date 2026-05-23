import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import BookingPage from './pages/BookingPage'
import GalleryPage from './pages/GalleryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChangePasswordPage from './pages/ChangePassword'
import ResetPasswordPage from './pages/ResetPassword'
import AdminCreateServicePage from './pages/CreateNewService'
import CreateSpecialistPage from './pages/CreateNewpecialist'
import Unauthorized from './pages/Unauthorized'
import NotFoundPage from './pages/NotFoundPage'
import { ToastProvider } from './components/Toast'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'

export const ThemeContext = createContext()
export function useTheme() { return useContext(ThemeContext) }

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index          element={<PageTransition><HomePage /></PageTransition>} />
                <Route path="about"   element={<PageTransition><AboutPage /></PageTransition>} />
                <Route path="services" element={<PageTransition><ServicesPage /></PageTransition>} />
                <Route path="gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
                <Route path="contact" element={<PageTransition><ContactPage /></PageTransition>} />
                <Route path="book"    element={
                  <ProtectedRoute allowedRoles={['admin','client']}>
                    <PageTransition><BookingPage /></PageTransition>
                  </ProtectedRoute>
                } />
              </Route>
              <Route path="/login"    element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
              <Route path="/change-password" element={
                <ProtectedRoute allowedRoles={['admin','client']}>
                  <PageTransition><ChangePasswordPage/></PageTransition>
                </ProtectedRoute>
              } />
              
              <Route path="/reset-password" element={
                <ProtectedRoute allowedRoles={['admin','client']}>
                  <PageTransition><ResetPasswordPage/></PageTransition>
                </ProtectedRoute>
              } />

              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path='/admin'>
                {/* <Route path='/admin/create-new-specialist' element={<PageTransition><CreateSpecialistPage/></PageTransition>}></Route> */}
                <Route path='/admin/create-new-service' element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PageTransition><AdminCreateServicePage /></PageTransition>
                  </ProtectedRoute>
                } 
                />
                <Route path='/admin/create-new-specialist' element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PageTransition><CreateSpecialistPage/></PageTransition>
                  </ProtectedRoute>
                } 
                />
                
              </Route>

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin','client']}>
                    <PageTransition><DashboardPage /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeContext.Provider>
  )
}
