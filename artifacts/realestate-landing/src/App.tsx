import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Properties from "@/pages/Properties";
import Admin from "@/pages/Admin";
import { DataProvider } from "@/store/dataStore";
import { PrithviProvider } from "@/store/prithviStore";
import { BhimaProvider } from "@/store/bhimaStore";
import PrithviHome from "@/pages/prithvi/PrithviHome";
import PrithviProperties from "@/pages/prithvi/PrithviProperties";
import PrithviPropertyDetail from "@/pages/prithvi/PrithviPropertyDetail";
import PrithviAdminLogin from "@/pages/prithvi/PrithviAdminLogin";
import PrithviAdmin from "@/pages/prithvi/PrithviAdmin";
import BhimaHome from "@/pages/bhima/BhimaHome";
import BhimaProperties from "@/pages/bhima/BhimaProperties";
import BhimaPropertyDetail from "@/pages/bhima/BhimaPropertyDetail";
import BhimaAdminLogin from "@/pages/bhima/BhimaAdminLogin";
import BhimaAdmin from "@/pages/bhima/BhimaAdmin";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Priya Estates */}
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/admin" component={Admin} />

      {/* Prithvi Real Estate */}
      <Route path="/prithvi" component={PrithviHome} />
      <Route path="/prithvi/properties" component={PrithviProperties} />
      <Route path="/prithvi/property/:id" component={PrithviPropertyDetail} />
      <Route path="/prithvi/admin" component={PrithviAdminLogin} />
      <Route path="/prithvi/admin/dashboard" component={PrithviAdmin} />

      {/* Bhima Homes & Properties */}
      <Route path="/bhima" component={BhimaHome} />
      <Route path="/bhima/properties" component={BhimaProperties} />
      <Route path="/bhima/property/:id" component={BhimaPropertyDetail} />
      <Route path="/bhima/admin" component={BhimaAdminLogin} />
      <Route path="/bhima/admin/dashboard" component={BhimaAdmin} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <PrithviProvider>
            <BhimaProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
            </BhimaProvider>
          </PrithviProvider>
        </DataProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
