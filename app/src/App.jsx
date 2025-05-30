import React, { useState, useEffect, useRef } from 'react';
import MainPage from './MainPage/MainPage';
import Login from './Login/Login';
import Signup from './signup/Signup';
import { StatusProvider } from './ContextComponents/StatusContext';
import ModalContainer from './ContextComponents/ModelContainer';
import { AuthProvider } from "./ContextComponents/AuthContext";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';


function App() {
  return (
    <Router>
      <StatusProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/:id" element={<MainPage />} />
        </Routes>
        <ModalContainer />
      </AuthProvider>
      </StatusProvider>
    </Router>
  );
}

// function App() {
//   const [showSignup, setShowSignup] = useState(false);
//   const [showLogin, setShowLogin] = useState(false);

//   const signupModalRef = useRef();
//   const loginModalRef = useRef();

//   const toggleSignup = () => {
//     setShowSignup(!showSignup);
//   };

//   const toggleLogin = () => {
//     setShowLogin(!showLogin);
//   };

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (showLogin && loginModalRef.current && !loginModalRef.current.contains(e.target)) {
//         setShowLogin(false);
//       }
//       if (showSignup && signupModalRef.current && !signupModalRef.current.contains(e.target)) {
//         setShowSignup(false);
//       }
//     };

//     if (showSignup || showLogin) {
//       document.addEventListener('mousedown', handleClickOutside);
//     } else {
//       document.removeEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showSignup, showLogin]);



//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           <Route path="/" element={<MainPage toggleSignup={toggleSignup} toggleLogin={toggleLogin} />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/:id" element={<MainPage toggleSignup={toggleSignup} toggleLogin={toggleLogin} />} />
//         </Routes>

//         {showSignup && (
//           <div className="login-modal-overlay">
//             <div className="login-modal" ref={signupModalRef}>
//               <Signup />
//             </div>
//           </div>
//         )}

//         {showLogin && (
//           <div className="login-modal-overlay">
//             <div className="login-modal" ref={loginModalRef}>
//               <Login />
//             </div>
//           </div>
//         )}
//       </AuthProvider>
//     </Router>
//   );
// }

export default App;
