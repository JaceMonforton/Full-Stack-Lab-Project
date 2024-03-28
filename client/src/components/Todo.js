import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, Button } from 'antd';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showLoading, hideLoading } from '../redux/alertSlice';
import toast from 'react-hot-toast';

function Todo() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const [tasks, setTasks] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                dispatch(showLoading());
                console.log('Fetching Saved Tasks...');
                const response = await fetch(`/api/user/${user._id}/tasks`);
                dispatch(hideLoading());
        
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('User not found or no tasks');
                    } else {
                        throw new Error(`Failed to fetch tasks. Status: ${response.status}`);
                    }
                }
        
                const userData = await response.json();
                console.log('Fetched tasks:', userData.tasks);
                if (userData.tasks) {
                    setTasks(userData.tasks);
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

    const onFinish = async (values) => {
        try {
            dispatch(showLoading());
            const response = await axios.post(`/api/user/${user._id}/tasks`, {
                ...values,
            });

            if (response.data.success) {
                dispatch(hideLoading());
                toast.success('Task Created!');
                setTasks([...tasks, response.data.task]);
            }
        } catch (error) {
            dispatch(hideLoading());
            toast.error('Error');
        }
    };

    const markComplete = async (taskId) => {
        try {
            console.log("Task ID:", taskId); 
            dispatch(showLoading());
    
            const updateTaskResponse = await axios.put(`/api/user/${user._id}/tasks/${taskId}/complete`);
    
            if (updateTaskResponse.data.success) {
                dispatch(hideLoading());
                toast.success('Task Complete!');
                const updatedTasks = tasks.filter(task => task._id !== taskId);
                setTasks(updatedTasks);
            } else {
                throw new Error('Failed to mark task as complete');
            }
        } catch (error) {
            dispatch(hideLoading());
            toast.error(error.message);
        }
    };

    return (
        <div>
            Your Path to Productivity!
            <Form layout="vertical" onFinish={onFinish}>
                <hr />
                <Row gutter={24}>
                    <Col span={8} xs={24} sm={24} lg={8}>
                        <Form.Item
                            required
                            label="Text"
                            name="taskText"
                            rules={[{ required: true, message: 'Please enter text' }]}
                        >
                            <Input type="text" placeholder="Enter Task" />
                        </Form.Item>
                    </Col>
                    <Col span={8} xs={24} sm={24} lg={8}>
                        <Form.Item
                            required
                            label="Priority"
                            name="taskPriority"
                            rules={[{ required: true, message: 'Please Enter A Priority' }]}
                        >
                            <Input type="text" placeholder="Priority Level (1-3)" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8} xs={24} sm={24} lg={8}>
                        <Form.Item required label="Date" name="taskDate" rules={[{ required: true }]}>
                            <Input placeholder="Day" type="date" />
                        </Form.Item>
                    </Col>
                    <Col span={8} xs={24} sm={24} lg={8}>
                        <Form.Item  label="Time" name="taskTime" rules={[{ required: false }]}>
                            <Input placeholder="Time" type="Time" />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="d-flex justify-content-end">
                    <Button type="primary" htmlType="submit">
                        Add Task
                    </Button>
                </div>
                <hr />
            </Form>
            <Button type='text-button' className='card3-title m-2' onClick={() => navigate('/')}>My Tasks</Button>
            |
            <Button type='text-button' className='card3-title m-2' onClick={() => navigate('/completedTasks')}>Completed Tasks</Button>
            <hr />

    {tasks
        .filter(task => !task.isComplete)
        .slice()
        .sort((a, b) => b.taskPriority - a.taskPriority)
        .map((task) => (
            <div key={task._id} className="task-card">
            <div className="task-header">
                <h3 className={`priority-${task.taskPriority}`}>
                {`${'!'.repeat(task.taskPriority)} ${task.taskText}`}
                </h3>
            </div>
            <div className="task-details">
                <p>Due: {task.taskDate} @ {task.taskTime}</p>
            </div>
            <div className="task-actions">
                <Button type='primary' className='custom-button' onClick={() => markComplete(task._id)}>Done</Button>
            </div>
            </div>
        ))
        }


        </div>
    );
}

export default Todo;
