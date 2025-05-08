import React from 'react';
import { useAuth } from './AuthContext';
import Login from '../Login/Login';
import Signup from '../signup/Signup';

const ModalContainer = () => {
  const { 
    showLoginModal, 
    showSignupModal,
    setShowLoginModal,
    setShowSignupModal 
  } = useAuth();

  return (
    <>
      {showSignupModal && (
        <div className="login-modal-overlay">
            <Signup onClose={() => setShowSignupModal(false)} />
        </div>
      )}

      {showLoginModal && (
        <div className="login-modal-overlay">
            <Login onClose={() => setShowLoginModal(false)} />

        </div>
      )}
    </>
  );
};

export default ModalContainer;