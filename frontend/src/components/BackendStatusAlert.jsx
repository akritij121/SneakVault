import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api/client';

const BackendStatusAlert = () => {
  const { isError, isLoading } = useQuery({
    queryKey: ['healthCheck'],
    queryFn: async () => {
      // Try to hit the root endpoint or a lightweight endpoint
      const { data } = await api.get('/');
      return data;
    },
    retry: 3, // Retry a few times before showing error
    retryDelay: 2000, // Wait 2 seconds between retries
    refetchInterval: 30000, // Check every 30 seconds
    refetchOnWindowFocus: false,
  });

  if (!isError) return null;

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-4 py-3">
      <div className="container mx-auto flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold">Backend Connection Issue</p>
          <p className="mt-1 opacity-90">
            The backend server is hosted on Render's free tier. If it has been inactive for a while, it may take up to a minute to spin up. 
            Please wait a moment and refresh the page.
          </p>
          {isLoading && (
            <div className="flex items-center gap-2 mt-2 text-xs font-medium opacity-75">
              <Loader2 className="w-3 h-3 animate-spin" />
              Attempting to reconnect...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackendStatusAlert;
