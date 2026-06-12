import { useToastStore } from '../store/useToastStore'

export function showQuotaWarning() {
  useToastStore.getState().showToast({
    variant: 'destructive',
    key: 'quota-warning',
    message: 'Не удалось сохранить — проверьте свободное место',
  })
}
