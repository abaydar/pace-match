import React, { createContext, useContext, useReducer } from 'react'
import {
  User,
  ReadyStatus,
  ConnectionRequest,
  MOCK_REQUESTS,
  CURRENT_RUNNER,
  CURRENT_LEADER,
} from '../data/mockData'

type Role = 'runner' | 'leader' | null

type AppState = {
  role: Role
  currentUser: User | null
  readyStatus: ReadyStatus | null
  connectionRequests: ConnectionRequest[]
}

type AppAction =
  | { type: 'SET_ROLE'; role: 'runner' | 'leader' }
  | { type: 'SET_READY_STATUS'; status: ReadyStatus | null }
  | { type: 'SEND_REQUEST'; toUserId: string }
  | { type: 'ACCEPT_REQUEST'; requestId: string }
  | { type: 'DECLINE_REQUEST'; requestId: string }

const initialState: AppState = {
  role: null,
  currentUser: null,
  readyStatus: null,
  connectionRequests: MOCK_REQUESTS,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return {
        ...state,
        role: action.role,
        currentUser: action.role === 'runner' ? CURRENT_RUNNER : CURRENT_LEADER,
      }
    case 'SET_READY_STATUS':
      return {
        ...state,
        readyStatus: action.status,
        currentUser: state.currentUser
          ? { ...state.currentUser, readyStatus: action.status }
          : null,
      }
    case 'SEND_REQUEST': {
      const newRequest: ConnectionRequest = {
        id: `r${Date.now()}`,
        fromUserId: state.currentUser?.id ?? 'me',
        toUserId: action.toUserId,
        status: 'pending',
      }
      return {
        ...state,
        connectionRequests: [...state.connectionRequests, newRequest],
      }
    }
    case 'ACCEPT_REQUEST':
      return {
        ...state,
        connectionRequests: state.connectionRequests.map((r) =>
          r.id === action.requestId ? { ...r, status: 'accepted' } : r
        ),
      }
    case 'DECLINE_REQUEST':
      return {
        ...state,
        connectionRequests: state.connectionRequests.map((r) =>
          r.id === action.requestId ? { ...r, status: 'declined' } : r
        ),
      }
    default:
      return state
  }
}

type AppContextType = AppState & {
  setRole: (role: 'runner' | 'leader') => void
  setReadyStatus: (status: ReadyStatus | null) => void
  sendConnectionRequest: (toUserId: string) => void
  acceptConnectionRequest: (requestId: string) => void
  declineConnectionRequest: (requestId: string) => void
  hasSentRequest: (toUserId: string) => boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const value: AppContextType = {
    ...state,
    setRole: (role) => dispatch({ type: 'SET_ROLE', role }),
    setReadyStatus: (status) => dispatch({ type: 'SET_READY_STATUS', status }),
    sendConnectionRequest: (toUserId) => dispatch({ type: 'SEND_REQUEST', toUserId }),
    acceptConnectionRequest: (requestId) => dispatch({ type: 'ACCEPT_REQUEST', requestId }),
    declineConnectionRequest: (requestId) => dispatch({ type: 'DECLINE_REQUEST', requestId }),
    hasSentRequest: (toUserId) =>
      state.connectionRequests.some(
        (r) =>
          r.fromUserId === (state.currentUser?.id ?? 'me') &&
          r.toUserId === toUserId &&
          (r.status === 'pending' || r.status === 'accepted')
      ),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
