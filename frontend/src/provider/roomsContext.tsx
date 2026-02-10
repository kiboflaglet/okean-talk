import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react"
import type { IRoom, RoomFilters } from "../interfaces"
import { useRooms } from "../hooks/useRoom"

type RoomsContextType = {
  rooms: IRoom[]
  loading: boolean
  error: string | null
  filters: RoomFilters
  setFilters: (f: RoomFilters) => void
  addRoom: (room: Partial<IRoom>) => Promise<void>
  updateRoom: (id: string, updates: Partial<IRoom>) => Promise<void>
  deleteRoom: (id: string) => Promise<void>
}

const RoomsContext = createContext<RoomsContextType | null>(null)

export const useRoomsContext = () => {
  const ctx = useContext(RoomsContext)
  if (!ctx) throw new Error("useRoomsContext must be used inside RoomsProvider")
  return ctx
}

export const RoomsProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<RoomFilters>({})

  const {
    rooms,
    loading,
    error,
    addRoom,
    updateRoom,
    deleteRoom,
  } = useRooms(filters)

  const value = useMemo(
    () => ({
      rooms,
      loading,
      error,
      filters,
      setFilters,
      addRoom,
      updateRoom,
      deleteRoom,
    }),
    [rooms, loading, error, filters]
  )

  return (
    <RoomsContext.Provider value={value}>
      {children}
    </RoomsContext.Provider>
  )
}
