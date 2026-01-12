import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 text-violet-500 animate-spin mx-auto" />
        <p className="text-zinc-400">Carregando...</p>
      </div>
    </div>
  );
}
