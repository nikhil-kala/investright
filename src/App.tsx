import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import About from './components/About'
import Footer from './components/Footer'
import Chat from './components/Chat'
import Login from './components/Login'
import Contact from './components/Contact'
import OurStory from './components/OurStory'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './components/Profile'
import Signup from './components/Signup'

function HomePage() {
  console.log('HomePage component rendering...')
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <About />
      <Footer />
    </div>
  )
}

function LoginPage() {
  console.log('LoginPage component rendering...')
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Login />
      <Footer />
    </div>
  )
}

function ContactPage() {
  console.log('ContactPage component rendering...')
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Contact />
      <Footer />
    </div>
  )
}

function OurStoryPage() {
  console.log('OurStoryPage component rendering...')
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <OurStory />
      <Footer />
    </div>
  )
}

function SignupPage() {
  console.log('SignupPage component rendering...')
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Signup />
      <Footer />
    </div>
  )
}

function ChatPage() {
  console.log('ChatPage component rendering...')
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Chat />
      {/* Footer hidden for chat page */}
    </div>
  )
}

function App() {
  console.log('App component rendering...')
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App;