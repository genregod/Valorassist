// client/src/App.tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/home";
import { NotFoundPage } from "./pages/not-found";
import { AzureDeploymentPage } from "./pages/azure-deployment";
import { HealthCheckPage } from "./pages/HealthCheck"; // The new page

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* This layout with Header and Footer is a robust pattern */}
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Switch>
              {/* Your existing routes */}
              <Route path="/" component={HomePage} />
              <Route path="/azure-deployment" component={AzureDeploymentPage} />
              
              {/* The new route for the health check page */}
              <Route path="/health" component={HealthCheckPage} />

              {/* Fallback to 404 for any other path */}
              <Route component={NotFoundPage} />
            </Switch>
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
