import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Navbar      from '@/components/ui/Navbar'
import HomePage    from '@/pages/HomePage'
import JoinPage    from '@/pages/JoinPage'
import TrackPage   from '@/pages/TrackPage'
import StaffPage   from '@/pages/StaffPage'
import DisplayPage from '@/pages/DisplayPage'
import AdminPage   from '@/pages/AdminPage'

/** Layout wrapper: renders the shared Navbar above the matched child route. */
function WithNav() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer-facing — with Navbar */}
        <Route element={<WithNav />}>
          <Route path="/"          element={<HomePage />} />
          <Route path="/join"      element={<JoinPage />} />
          <Route path="/track"     element={<TrackPage />} />
          <Route path="/track/:id" element={<TrackPage />} />
          <Route path="/staff"     element={<StaffPage />} />
          <Route path="/admin"     element={<AdminPage />} />
        </Route>

        {/* Display screen — full-screen, no Navbar */}
        <Route path="/display" element={<DisplayPage />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-ivory flex items-center justify-center">
              <div className="text-center">
                <p className="font-heading text-[6rem] text-cream-dark leading-none">404</p>
                <h1 className="font-heading text-h2 text-charcoal mt-2">Page not found</h1>
                <a
                  href="/"
                  className="mt-6 inline-block font-body text-sm text-sage hover:text-sage-dark underline"
                >
                  Back to home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
