import React, { useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Calendar } from 'antd';
import { useSelector } from 'react-redux';
import Todo from '../components/Todo';
function Home() {

    const getData = async() => {
        try {
            const response = await axios.post('/api/user/get-user-info-by-id', {} ,
            {
               headers : {
                    Authorization : `Bearer ` + localStorage.getItem('token')
                }
            })
            console.log(response.data)
        } catch (error) {
            
        }
    }
    useEffect(()=> {

        getData();

    }, [] )


  return (
    <Layout>
      <h1 className='page-title'>
        
        <Todo/>
        
        </h1>

      <div className='task-container'>
        
          

      </div>      

    </Layout>
  )
}

export default Home
