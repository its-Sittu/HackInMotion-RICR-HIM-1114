import ActiveWarnings from '../components/dashboard/ActiveWarnings'
import '../styles/dashboard.css'

export default function DashboardPage() {
  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <h1 className="dashboard-heading">Medicine Safety Dashboard</h1>
        
        <p className="dashboard-subheading">
          Smart Medicine Safety & Drug Interaction Assistant
        </p>
        
        <div className="divider-line"></div>
        
        <ActiveWarnings />
      </main>
    </div>
  )
}
