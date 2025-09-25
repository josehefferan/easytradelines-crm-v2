import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Panel from "./pages/Panel.jsx";
import MiCuenta from "./pages/MiCuenta.jsx";
import RequireAuth from "./lib/RequireAuth.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
