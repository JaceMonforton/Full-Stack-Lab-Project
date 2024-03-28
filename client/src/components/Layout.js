import React, { useState } from 'react';
import "../layout.css";
import "../index.css";
import { Link, useNavigate} from 'react-router-dom';
import { useSelector } from 'react-redux';
function Layout({children}) {
  
    const navitage = useNavigate();
    const {user} = useSelector((state) => state.user)


  const onLogout = () => {
    localStorage.removeItem('token');
    navitage('/login')
  }


    return (
        <div className='main'>
          <div className='d-flex layout'>
    
            { /* Header */ }

<div className='content'>
    <div className='header'>  
    
    <div className='d-flex p-3'>
    <h4 className='anchor'>{user?.name}</h4>
    </div>
                 <Link className='anchor' to='/login' onClick={()=> {onLogout()}}>
                    <i className ='ri-logout-box-line' />
                    {<span>Logout</span>}
                  </Link>

    </div>

    <div className='body'>    
     {children}
    </div>
</div>


</div>


</div>
)
}

export default Layout