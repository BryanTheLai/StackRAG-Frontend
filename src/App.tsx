import Layout from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { Route, Switch } from "wouter";
import PrivateRoute from "@/components/PrivateRoute";
import Dashboard from "@/pages/private/Dashboard";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ErrorPage from "@/pages/Error";
import Home from "@/pages/Home";
import Documents from "./pages/private/Documents";
import Chat from "./pages/private/Chat";
import ChatHistoryPage from "./pages/private/ChatHistory"; // Corrected import path
import ProfilePage from "@/pages/private/Profile";

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <main>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/private/dashboard">
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            </Route>{" "}
            <Route path="/private/documents">
              <PrivateRoute>
                <Documents />
              </PrivateRoute>
            </Route>
            <Route path="/private/chat/:id">
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            </Route>
            <Route path="/private/chathistory">
              <PrivateRoute>
                <ChatHistoryPage />
              </PrivateRoute>
            </Route>
            <Route path="/private/profile">
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            </Route>
            <Route path="*">
              <ErrorPage
                title="404: Page Not Found"
                message="Sorry, the page you are looking for does not exist"
              />
            </Route>
          </Switch>
        </main>
      </Layout>
    </AuthProvider>
  );
}
