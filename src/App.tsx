import React from 'react';
import './App.css';
import HeaderApp from './module/core/components/HeaderApp';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './module/contexts/AuthContext';
import AppRoutes from './Routes';
//import NotFound from './components/NotFound'; <Route path="*" element={<NotFound />} />

const App: React.FC = () => {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <HeaderApp></HeaderApp>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
};

export default App;
