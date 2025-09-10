import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Panel from "./pages/Panel";
import MiCuenta from "./pages/MiCuenta";
import RequireAuth from "./lib/RequireAuth";

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
