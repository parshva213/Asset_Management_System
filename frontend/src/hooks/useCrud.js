import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import api from "../api"

// Generic CRUD hook with optimistic updates and rollback
export default function useCrud(resourcePath, options = {}) {
  const idKey = options.idKey || "id"
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const previousSnapshotRef = useRef(null)

  const takeSnapshot = () => {
    previousSnapshotRef.current = JSON.parse(JSON.stringify(items))
  }

  const rollback = () => {
    if (previousSnapshotRef.current) {
      setItems(previousSnapshotRef.current)
      previousSnapshotRef.current = null
    }
  }

  const list = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/${resourcePath}`)
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [resourcePath])

  const create = useCallback(
    async (payload) => {
      setError(null)
      setMessage(null)
      takeSnapshot()
      const tempId = `temp-${Date.now()}`
      const optimistic = { [idKey]: tempId, ...payload }
      setItems((prev) => [optimistic, ...prev])
      try {
        const { data } = await api.post(`/${resourcePath}`, payload)
        const saved = data && typeof data === "object" ? data : null
        if (saved && saved[idKey] != null) {
          setItems((prev) => prev.map((it) => (it[idKey] === tempId ? saved : it)))
        } else {
          // Fallback: reload if API doesn't return created entity
          await list()
        }
        setMessage("Created successfully")
      } catch (err) {
        rollback()
        setError(err?.message || "Failed to create")
      }
    },
    [idKey, list, resourcePath]
  )

  const update = useCallback(
    async (id, payload) => {
      setError(null)
      setMessage(null)
      takeSnapshot()
      setItems((prev) => prev.map((it) => (it[idKey] === id ? { ...it, ...payload } : it)))
      try {
        const { data } = await api.put(`/${resourcePath}/${id}`, payload)
        const saved = data && typeof data === "object" ? data : null
        if (saved && saved[idKey] != null) {
          setItems((prev) => prev.map((it) => (it[idKey] === id ? saved : it)))
        } else {
          // Fallback to ensure consistency
          await list()
        }
        setMessage("Updated successfully")
      } catch (err) {
        rollback()
        setError(err?.message || "Failed to update")
      }
    },
    [idKey, list, resourcePath]
  )

  const remove = useCallback(
    async (id) => {
      setError(null)
      setMessage(null)
      takeSnapshot()
      setItems((prev) => prev.filter((it) => it[idKey] !== id))
      try {
        await api.delete(`/${resourcePath}/${id}`)
        setMessage("Deleted successfully")
      } catch (err) {
        rollback()
        setError(err?.message || "Failed to delete")
      }
    },
    [idKey, resourcePath]
  )

  useEffect(() => {
    list()
  }, [list])

  return useMemo(
    () => ({ items, setItems, loading, error, message, list, create, update, remove }),
    [items, loading, error, message, list, create, update, remove]
  )
}


