import { Admin } from "@/components/admin/Admin";
import { CatchAll } from "@/components/CatchAll";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Login } from "@/components/login/Login";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import  DashboardPage from "@/dashboard/DashboardPage";
import { Signup } from "@/components/signup/Signup";
import { UpdatesPage } from "@/components/updates/UpdatesPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { BackendProvider } from "@/contexts/BackendContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { CookiesProvider } from "react-cookie";
import { Layout } from "@/components/navigation/Layout";
import { ProgramForm } from "@/components/dashboard/ProgramForm";
import {
Navigate,
  Route,
  BrowserRouter as Router,  
  Routes,
  useParams
} from "react-router-dom";

import { Account } from "./components/accounts/Account";
import { Media } from "./components/media/Media";

const App = () => {
  return (
    <CookiesProvider>
      <BackendProvider>
        <AuthProvider>
          <RoleProvider>
            <Router>
              <Routes>
                <Route
                  path="/login"
                  element={<Login />}
                />
                <Route
                  path="/signup"
                  element={<Signup />}
                />

                <Route
                  path="/"
                  element={<ProtectedRoute element={<Layout />}/>}
                >
                  <Route
                    path="dashboard"
                    element={<Dashboard />}
                  />
                  
                  <Route
                    path="admin"
                    element={
                      <ProtectedRoute
                        element={<Admin />}
                        allowedRoles={["admin"]} />}
                    />

                  {/* TODO: Change /account & /media route to protected when auth flow finalized */}
                  <Route
                    path="account/:userId"
                    element={<Account />}
                  />
                  
                  <Route
                    path="media/:userId"
                    element={<Media />}
                  />
                  
                  <Route
                    path="dashboard/:userId"
                    element={<DashboardPage />}
                  />
                  
                  
                  <Route
                    path="create-program-form-test"
                    element={<ProgramForm />}
                  />
                  
                  <Route
                    path="/updates/:userId"
                    element={<UpdatesPage />}
                  />

                </Route>
                <Route
                  path="*"
                  element={<ProtectedRoute element={<CatchAll />} />}
                />
                
              </Routes>
            </Router>
          </RoleProvider>
        </AuthProvider>
      </BackendProvider>
    </CookiesProvider>
  );
};

export default App;
