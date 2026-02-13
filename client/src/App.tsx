import { Admin } from "@/components/admin/Admin";
import { CatchAll } from "@/components/CatchAll";
import Dashboard from "@/components/dashboard/Dashboard";
import { ProgramForm } from "@/components/dashboard/ProgramForm";
import { Login } from "@/components/login/Login";
import { Layout } from "@/components/navigation/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Signup } from "@/components/signup/Signup";
import { UpdatesPage } from "@/components/updates/UpdatesPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { BackendProvider } from "@/contexts/BackendContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { CookiesProvider } from "react-cookie";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

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
                  element={<ProtectedRoute element={<Layout />} />}
                >
                  <Route
                    path="admin"
                    element={
                      <ProtectedRoute
                        element={<Admin />}
                        allowedRoles={["Admin"]}
                      />
                    }
                  />

                  <Route
                    path={"account"}
                    element={
                      <ProtectedRoute
                        element={<Account />}
                        allowedRoles={["Admin", "Regional Director"]}
                      />
                    }
                  />

                  <Route
                    path={"media"}
                    element={
                      <ProtectedRoute
                        element={<Media />}
                        allowedRoles={["Program Director"]}
                      />
                    }
                  />

                  <Route
                    path={"dashboard"}
                    element={<Dashboard />}
                  />

                  <Route
                    path={"updates"}
                    element={<UpdatesPage />}
                  />
                </Route>
                
                <Route path="*" element={<ProtectedRoute element={<CatchAll />} />} />
              </Routes>
            </Router>
          </RoleProvider>
        </AuthProvider>
      </BackendProvider>
    </CookiesProvider>
  );
};

export default App;