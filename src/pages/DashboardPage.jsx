import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'
import OverviewCards from '../components/dashboard/OverviewCards'
import CurrentMedicines from '../components/dashboard/CurrentMedicines'
import ActiveWarnings from '../components/dashboard/ActiveWarnings'
import RecentChecks from '../components/dashboard/RecentChecks'
import '../styles/dashboard.css'

export default function DashboardPage() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="dashboard-content-container">
        <Header />
        
        <OverviewCards />
        
        <div className="dashboard-page-title-area">
          <h1 className="dashboard-heading">Medicine Safety Dashboard</h1>
          <p className="dashboard-subheading">
            Smart Medicine Safety & Drug Interaction Assistant
          </p>
        </div>
        
        <main className="dashboard-main-content">
          <CurrentMedicines />
          <ActiveWarnings />
        </main>
        
        <RecentChecks />
      </div>
    </div>
  )
}




