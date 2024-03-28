const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/authMiddleware');

const User = require('../models/userModel');
const Task = require('../models/taskModel');

  const router = express.Router();

  router.post('/register', async (req, res) => {
    try {
      const userExists = await User.findOne({ email: req.body.email });
  
      if (userExists) {
        return res.status(200).json({ message: 'Email is already in use', success: false });
      }
  
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword, 
      });
  
      await newUser.save();
  
      res.status(201).json({ message: 'User created successfully', success: true });
    } catch (error) {
      console.error('Error creating user:', error);
      res
      .status(500)
      .send({ message: 'Error creating user', success: false, error });
    }
  });

  router.post('/login', async (req, res) => {
    try {
  
     const user = await User.findOne({email: req.body.email})
  
     if (!user) {
      return res
      .status(200)
      .send({message: "User Does not Exist" , success: false})
     }
  
     const  isMatch = await bcrypt.compare(req.body.password, user.password);
     if (!isMatch) {
      return res
      .status(200)
      .send({message: "Password is incorrect" , success: false})
     }else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET , {
        expiresIn: '1d',
      })
      res
      .status(200)
      .send({ message: "Login Successful" , success: true, data: token });
     }
    } catch (error) {
      console.log(error);
      console.error('Error during login:', error);
      res.status(500).send({ message: 'Error during login', success: false, error });
    }
  });
  
  router.post('/get-user-info-by-id', authMiddleware, async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      user.password = undefined;
  
      if (!user) {
        return res.status(200).send({ message: "User does not exist", success: false });
      } else {
        return res.status(200).send({
          success: true,
          data: user,
        });
      }
    } catch (error) {
      res.status(500).send({ message: "Error Getting User info", success: false, error });
    }
  });

  router.get('/:userId/get-user-info-by-id', async (req, res) => {
    const userId = req.params.userId;
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
    
      return res.status(200).json({ message:"Fetched User Info" , success: true, data: user });
    } catch (error) {
      console.error('Error getting user info:', error);
      return res.status(500).json({ success: false, message: "Error getting user info", error });
    }
  });

  router.post('/:userId/tasks', async (req, res) => {
    const userId = req.params.userId;
    try {
        const newTask = new Task({ ...req.body });
        await newTask.save(); 

        if (newTask.taskPriority > 3) {
          return res.status(400).json({message: "Priority Must be less than or equal to 3"})
        }


        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $push: { savedTasks: newTask } }, 
            { new: true }
        );

        res.status(200).json({ task: newTask, updatedUser, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/:userId/tasks', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
  
      const tasks = [...user.savedTasks]; 
      
      res.status(200).json({ success: true, tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  router.post('/:userId/completedtasks/:taskId', async (req, res) => {
    const taskId = req.params.taskId;
    const userId = req.params.userId;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (task.isComplete) {
          return res.status(404).json({message: "Task is already complete, please refresh."})
        }

        task.isComplete = true;

        await task.save();

        const user = await User.findByIdAndUpdate(
          userId,
          { 
              $push: { completeTasks: task },
          },
          { new: true }
      );

 
        res.status(200).json({ task: task, user: user, success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
  });

  router.delete('/:userId/completedTasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.params.userId;

  console.log('Received task id:', taskId);
  console.log('Received user id:', userId);

  try {
    const user = await User.findById(userId);
    await Task.findByIdAndDelete(taskId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: "User not found" });
    }

    const taskToDelete = user.completeTasks.find(task => task._id.toString() === taskId);

    if (!taskToDelete) {
      console.log('Task not found in user\'s completeTasks');
      return res.status(404).json({ error: "Task not found" });
    }

    user.completeTasks = user.completeTasks.filter(task => task._id.toString() !== taskId);
    await user.save();


    console.log('Task deleted successfully');
    return res.status(200).json({ message: "Deleted Successfully", deletedTask: taskId, updatedUser: user, success: true });

  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  });

  router.get('/:userId/completeTasks', async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        const completeTasks = user.completeTasks; 
        res.status(200).json({ success: true, completeTasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  router.put('/:userId/tasks/:taskId/complete', async (req, res) => {
    const taskId = req.params.taskId;
    const userId = req.params.userId;
    console.log("Request Parameters:", req.params);
    try {
        const user = await User.findById(userId);
  
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const task = user.savedTasks.find(task => task._id.toString() === taskId);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        task.isComplete = true;
        await user.save();

        user.completeTasks.push(task);
        user.savedTasks = user.savedTasks.filter(task => task._id.toString() !== taskId);
        await user.save();

        await Task.findByIdAndUpdate(taskId, {
          isComplete: true,
        })

        return res.status(200).json({ message: 'Task marked as complete and moved to completeTasks', success: true });
    } catch (error) {
        console.error('Error marking task as complete and moving to completeTasks:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
  });









  module.exports = router;
