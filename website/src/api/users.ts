import { MAX_LIMIT, request } from "@/api/client"
import type { User, UserCreate, UserUpdate } from "@/types/user"

export const listUsers = () => request<User[]>("/users/", { query: { limit: MAX_LIMIT } })

export const createUser = (data: UserCreate) => request<User>("/users/", { method: "POST", body: data })

export const updateUser = (id: number, data: UserUpdate) =>
  request<User>(`/users/${id}`, { method: "PUT", body: data })

export const deleteUser = (id: number) => request<User>(`/users/${id}`, { method: "DELETE" })
