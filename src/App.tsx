import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./module/contexts/AuthContext";
import AppRoutes from "./routes";

const App: React.FC = () => {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
};

export default App;
