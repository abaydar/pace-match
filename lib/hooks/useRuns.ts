import { useState, useCallback, useEffect, useRef } from 'react'
import { useGetSupabase } from './useSupabase'
import type { Run, RunInvite } from '../../types'

export interface RunWithInvites extends Run {
  invites: RunInvite[]
}

export interface AcceptedRunner {
  id: string
  name: string
  location: string | null
  latitude: number | null
  longitude: number | null
}

export function useRuns(currentUserId?: string) {
  const getSupabase = useGetSupabase()
  const [hostedRuns, setHostedRuns] = useState<RunWithInvites[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHostedRuns = useCallback(async () => {
    if (!currentUserId) return
    setLoading(true)
    setError(null)
    try {
      const sb = await getSupabase()
      const { data, error: err } = await sb
        .from('runs')
        .select('*, run_invites(*)')
        .eq('host_id', currentUserId)
        .order('time', { ascending: false })
      if (err) throw err
      setHostedRuns(
        (data ?? []).map((r: any) => ({ ...r, invites: r.run_invites ?? [] }))
      )
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  const createRun = useCallback(
    async (run: Omit<Run, 'id' | 'created_at' | 'status'>): Promise<Run> => {
      const sb = await getSupabase()
      const { data, error: err } = await sb
        .from('runs')
        .insert({ ...run, status: 'open' })
        .select()
        .single()
      if (err) throw err
      return data
    },
    []
  )

  const inviteRunners = useCallback(
    async (runId: string, runnerIds: string[]): Promise<void> => {
      const sb = await getSupabase()
      const rows = runnerIds.map((runner_id) => ({ run_id: runId, runner_id }))
      const { error: err } = await sb.from('run_invites').insert(rows)
      if (err) throw err
    },
    []
  )

  const respondToInvite = useCallback(
    async (inviteId: string, status: 'accepted' | 'declined'): Promise<void> => {
      const sb = await getSupabase()
      const { error: err } = await sb
        .from('run_invites')
        .update({ status })
        .eq('id', inviteId)
      if (err) throw err
    },
    []
  )

  return { hostedRuns, loading, error, fetchHostedRuns, createRun, inviteRunners, respondToInvite }
}

export function useAcceptedRunners(runId: string | undefined) {
  const getSupabase = useGetSupabase()
  const [runners, setRunners] = useState<AcceptedRunner[]>([])
  const [loading, setLoading] = useState(false)
  const channelRef = useRef<any>(null)

  const fetch = useCallback(async () => {
    if (!runId) return
    setLoading(true)
    try {
      const sb = await getSupabase()
      const { data } = await sb
        .from('run_invites')
        .select('runner_id, users(id, name, location, latitude, longitude)')
        .eq('run_id', runId)
        .eq('status', 'accepted')
      setRunners(
        (data ?? [])
          .map((row: any) => {
            const u = Array.isArray(row.users) ? row.users[0] : row.users
            return u ?? null
          })
          .filter(Boolean)
      )
    } finally {
      setLoading(false)
    }
  }, [runId])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    if (!runId) return
    let active = true
    getSupabase().then((sb) => {
      if (!active) return
      const channel = sb
        .channel(`run_invites_${runId}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'run_invites',
          filter: `run_id=eq.${runId}`,
        }, () => fetch())
        .subscribe()
      channelRef.current = { sb, channel }
    })
    return () => {
      active = false
      if (channelRef.current) {
        const { sb, channel } = channelRef.current
        sb.removeChannel(channel)
        channelRef.current = null
      }
    }
  }, [runId, fetch])

  const sendMessage = useCallback(async (senderId: string, body: string) => {
    if (!runId) return
    const sb = await getSupabase()
    await sb.from('run_messages').insert({ run_id: runId, sender_id: senderId, body })
  }, [runId])

  return { runners, loading, refetch: fetch, sendMessage }
}

export function useRunInvite(runId: string | undefined, currentUserId?: string) {
  const getSupabase = useGetSupabase()
  const [run, setRun] = useState<Run | null>(null)
  const [host, setHost] = useState<{ id: string; name: string } | null>(null)
  const [invite, setInvite] = useState<RunInvite | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!runId || !currentUserId) return
    setLoading(true)
    try {
      const sb = await getSupabase()
      const [runRes, inviteRes] = await Promise.all([
        sb.from('runs').select('*, users(id, name)').eq('id', runId).single(),
        sb.from('run_invites').select('*').eq('run_id', runId).eq('runner_id', currentUserId).single(),
      ])
      if (runRes.data) {
        const { users, ...runData } = runRes.data as any
        setRun(runData)
        setHost(Array.isArray(users) ? users[0] : users)
      }
      if (inviteRes.data) setInvite(inviteRes.data)
    } finally {
      setLoading(false)
    }
  }, [runId, currentUserId])

  useEffect(() => { fetch() }, [fetch])

  return { run, host, invite, loading, refetch: fetch }
}
