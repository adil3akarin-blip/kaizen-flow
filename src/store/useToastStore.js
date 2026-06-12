import { create } from 'zustand'

const DEFAULT_DURATION = {
 success: 4000,
 destructive: 5000,
}

export const useToastStore = create((set, get) => ({
 toast: null,
 timeoutId: null,

 showToast: ({
 variant = 'success',
 message,
 actionLabel,
 onAction,
 onDismiss,
 duration,
 key,
 }) => {
 const existing = get()
 if (existing.timeoutId) clearTimeout(existing.timeoutId)

 const toast = {
 id: crypto.randomUUID(),
 variant,
 message,
 actionLabel,
 onAction,
 onDismiss,
 key,
 }

 const ms = duration ?? DEFAULT_DURATION[variant] ?? 4000

 const timeoutId = setTimeout(() => {
 get().dismissToast()
 }, ms)

 set({ toast, timeoutId })
 },

 dismissToast: () => {
 const { timeoutId, toast } = get()
 if (timeoutId) clearTimeout(timeoutId)
 toast?.onDismiss?.()
 set({ toast: null, timeoutId: null })
 },

 clearToast: () => {
 const { timeoutId } = get()
 if (timeoutId) clearTimeout(timeoutId)
 set({ toast: null, timeoutId: null })
 },
}))
