import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'
import OverviewCards from '../components/dashboard/OverviewCards'
import '../styles/dashboard.css'

export default function DashboardPage() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="dashboard-content-container">
        <Header />
        <OverviewCards />
        <main className="dashboard-main">
          <h1 className="dashboard-heading">Medicine Safety Dashboard</h1>
          
          <p className="dashboard-subheading">
            Smart Medicine Safety & Drug Interaction Assistant
          </p>
          
          <div className="divider-line"></div>
          
          <div className="dashboard-body-placeholder" aria-hidden="true">
            <svg 
              className="placeholder-icon" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
            <span className="placeholder-text">System Initialized</span>
          </div>
        </main>
      </div>
    </div>
  )
}

