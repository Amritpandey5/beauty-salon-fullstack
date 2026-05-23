import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import NewsletterBanner from '../components/NewsletterBanner'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory-50 dark:bg-obsidian-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* <NewsletterBanner /> */}
      <Footer />
    </div>
  )
}
