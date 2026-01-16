import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts';
import { AppRoutes } from './routes';
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;