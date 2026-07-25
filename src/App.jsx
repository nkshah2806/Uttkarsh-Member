import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/login";
import ForgetPassword from "./pages/ForgetPassword/forget-password";
import Dashboard from "./pages/Dashboard/dashboard";
import { Toaster } from "sonner";
import ResetPassword from "./pages/ResetPassword/reset-password";
import PrivateRoute from "./routes/private-route";
import User from "./pages/User";
import UserEdit from "./pages/User/create";
import UserDetails from "./pages/User/UserDetails";
import { DashboardOverview, ClientManagement, ReportEntry, ReportDesigner } from "./pages/HealthAnalysis";

function App() {
  return (
    <>
      {/* <FCMToken /> */}
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/health-dashboard" element={<DashboardOverview />} />
            <Route path="/clients" element={<ClientManagement />} />
            <Route path="/report-entry" element={<ReportEntry />} />
            <Route path="/report-designer" element={<ReportDesigner />} />
            <Route path="/user">
              <Route index element={<User />} />
              <Route path="edit/:id" element={<UserEdit />} />
            </Route>
            <Route path="/user/:id" element={<UserDetails />} />
          </Route>
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
