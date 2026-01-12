import { toast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export function useToast() {
  return {
    toast: (options: ToastOptions & { variant?: 'default' | 'destructive' }) => {
      const { title, description, variant, duration } = options;

      if (variant === 'destructive') {
        return toast.error(title || 'Erro', {
          description,
          duration: duration || 4000,
        });
      }

      return toast(title || 'Notificação', {
        description,
        duration: duration || 4000,
      });
    },
    success: (title: string, description?: string) => {
      return toast.success(title, {
        description,
        duration: 4000,
      });
    },
    error: (title: string, description?: string) => {
      return toast.error(title, {
        description,
        duration: 4000,
      });
    },
    info: (title: string, description?: string) => {
      return toast.info(title, {
        description,
        duration: 4000,
      });
    },
    warning: (title: string, description?: string) => {
      return toast.warning(title, {
        description,
        duration: 4000,
      });
    },
  };
}
