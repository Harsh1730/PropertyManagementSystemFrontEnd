import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Dashboard from "./pages/Dashboard.tsx";

import LandingPage from "./pages/LandingPage";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />
                    </Route>

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </ThemeProvider>
    );
}

export default App;