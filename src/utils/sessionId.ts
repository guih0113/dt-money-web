export const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('dt-money-session-id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('dt-money-session-id', sessionId)
    console.log('🆔 Created new sessionId:', sessionId)
  }
  return sessionId
}
