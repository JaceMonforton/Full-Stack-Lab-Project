import React from 'react';
import { Routes, Route, BrowserRouter  } from 'react-router-dom';
import 'antd/dist/reset.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Complete from './pages/CompleteTasks';

import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {

  const {loading} = useSelector(state=> state.alerts)


  return (

      <BrowserRouter>

      {loading && (<div className='spinner-parent'>

<div className='spinner-border' role='status'>
  
</div>

</div>)}

<Toaster 
    position='top-center'
    reverseOrder={false}
    />
      <Routes>

      <Route path='/login' element={<PublicRoute> <Login /> </PublicRoute>} />
        <Route path='/register' element={<PublicRoute> <Register /> </PublicRoute>} />
        <Route path='/' element={<ProtectedRoute> <Home /> </ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
        <Route path='/completedTasks' element={<ProtectedRoute> <Complete /> </ProtectedRoute>} />


      </Routes>
   
      </BrowserRouter>
  );
}

export default App;
