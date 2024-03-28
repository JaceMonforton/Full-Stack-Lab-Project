import { Button, Card } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { showLoading, hideLoading } from '../redux/alertSlice';

function CompleteTasks() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const [tasks, setTasks] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {

        const fetchTasks = async () => {
            try {

                dispatch(showLoading());
                console.log('Fetching Saved Tasks...');

                const response = await fetch(`/api/user/${user._id}/completeTasks`);
                dispatch(hideLoading());
        
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('User not found or no tasks');
                    } else {
                        throw new Error(`Failed to fetch tasks. Status: ${response.status}`);
                    }
                }

                const userData = await response.json();
                
                if (userData.completeTasks.length === 0) {
                    toast.error("No Complete Tasks")
                } else {
                    toast.success("Complete Tasks Recieved, Refresh!")
                }
                console.log('Fetched tasks:', userData.completeTasks);
                if (userData.completeTasks) {
                    setTasks(userData.completeTasks);
                } else {
                    setTasks([]);
                }

            } catch (error) {
                dispatch(hideLoading());
                console.error('Error fetching tasks:', error);
                toast.error(error.message);
            }
        };

        if (user?._id) {
            fetchTasks();
        }

    }, [user?._id, dispatch]);

    const onDelete = async (taskId) => {
        try {
            dispatch(showLoading());
            console.log('Deleting Task with ID:', taskId);
            const response = await axios.delete(`/api/user/${user._id}/completedTasks/${taskId}`);
            if (response.data.success) {
                toast.success('Task Deleted!');
                const updatedTasks = tasks.filter(task => task._id !== taskId);
                setTasks(updatedTasks);
                window.location.reload();
            } else {
                toast.error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting Task:', error.message);
            toast.error('Error deleting task');
        } finally {
            dispatch(hideLoading()); 
        }
    };

    return (
        <Layout>
            <div className='card-title'>
                <Button type='text-button' className='card3-title m-4' onClick={() => {navigate('/')}}>Home</Button>            
                | 
                <Button type='text-button' className='card3-title m-4' onClick={ () => {navigate('/completedTasks')}}>Completed Tasks</Button>                
            </div>
    
            {user?.completeTasks
            .slice() 
            .sort((a, b) => b.taskPriority - a.taskPriority)
            .map((task) => (
                <Card
                    key={task._id}
                    title={`${'!'.repeat(task.taskPriority)} ${task.taskText}`} 
                    style={{ width: 600, margin: '16px' }}
                    extra={
                        <Button danger onClick={() => onDelete(task._id)}>
                            <i className='ri-delete-bin-line' />
                        </Button>
                    }
                >
                    <p>Due: {task.taskDate} @ {task.taskTime}</p>
                </Card>
            ))}
    
        </Layout>
    );
                }    

export default CompleteTasks;