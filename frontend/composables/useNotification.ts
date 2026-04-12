import { ref } from "vue";

export type NotificationType = "info" | "warning" | "error" | "success";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

const current = ref<Notification | null>(null);
let counter = 0;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export function useNotification() {
  function notify(type: NotificationType, message: string) {
    if (dismissTimer) clearTimeout(dismissTimer);
    counter++;
    current.value = { id: counter, type, message };
    dismissTimer = setTimeout(() => {
      current.value = null;
    }, 5000);
  }

  function dismiss() {
    if (dismissTimer) clearTimeout(dismissTimer);
    current.value = null;
  }

  return { current, notify, dismiss };
}
