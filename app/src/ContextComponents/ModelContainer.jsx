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
          <div className="login-modal">
            <Signup onClose={() => setShowSignupModal(false)} />
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal">
            <Login onClose={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default ModalContainer;