/**
 * Health service to handle health check business logic
 */
export const getHealthStatus = () => {
  return {
    success: true,
    message: 'MediGuard backend is running'
  }
}
