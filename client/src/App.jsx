import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';
import { UserContext } from './context/UserContext.jsx';
import ProtectedRoute from './components/ProtectedRoutes.jsx';
import VerifyAccount from './pages/VerifyAccount.jsx';

const App = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-[url('/bgImage.svg')] bg-cover bg-center">
      <Routes>
        <Route path="/" element={<ProtectedRoute>
          <Home />
        </ProtectedRoute>} />

        {/* Public Routes (redirect if logged in) */}
        <Route
          path="/signup"
          element={<Signup />}
        />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        <Route path='/verify-account' element={<VerifyAccount />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );

};

export default App;