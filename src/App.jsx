import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Panel from "./pages/Panel.jsx";
import MiCuenta from "./pages/MiCuenta.jsx";
import BrokerPanel from "./pages/BrokerPanel.jsx";
import RequireAuth from "./lib/RequireAuth.jsx";
import Signup from './pages/Signup';
import EmailConfirmed from './pages/EmailConfirmed';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route 
          path="/panel" 
          element={
            <RequireAuth>
              <Panel />
            </RequireAuth>
          } 
        />
        <Route 
          path="/mi-cuenta" 
          element={
            <RequireAuth>
              <MiCuenta />
            </RequireAuth>
          } 
        />
        <Route 
          path="/broker/panel" 
          element={
            <RequireAuth>
              <BrokerPanel />
            </RequireAuth>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
