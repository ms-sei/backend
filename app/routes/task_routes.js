const express = require('express')
// import passport 
const passport = require('passport')
//JWT
const requireToken = passport.authenticate('bearer', {session:false})
//Index 
const router = express.Router()

//import models 
const { User, Task } = require('../models/user')

const customErrors = require('../../lib/custom_errors')
const requireOwnership = customErrors.requireOwnership;

const handle404 = customErrors.handle404
//INDEX
// GET // tasks
router.get('/tasks',requireToken, (req,res,next) => {
    res.send(req.user.tasks)
})
// CREATE
router.post('/tasks', requireToken, (req,res,next)=>{
    const newTask = new Task(req.body)
    User.update(
        {_id: req.user._id},
        {$push: {tasks: newTask}}
    )
    .then(
        updateInfo => res.status(201).send(updateInfo)
    )
    .catch(
        err => res.status(400).send(err)
    )
})
// //show a specific task by a specific user
router.get('/tasks/:id', requireToken,(req, res)=> {
    const task =  req.user.tasks.find(task => String(task._id) === req.params.id)
    res.send(task)
})

router.patch('/tasks/:id', requireToken , (req,res,next)=>{
    const newTask = new Task(req.body) 
    const taskIndex = req.user.tasks.findIndex(task => String(task._id) === req.params.id)
    req.user.tasks[taskIndex] = newTask
    req.user.save()
    .then(
        user => res.send(user)
    )
    .catch(
        err => res.send(err)
    )
})

// // Delete --DESTROY a task
router.delete('/tasks/:id', requireToken, (req, res) => {
        const taskIndex = req.user.tasks.findIndex(task => String(task._id) === req.params.id)
        req.user.tasks.splice(taskIndex, 1)
        req.user.save()
        .then(
            user => res.send("Task was deleted")
        )
        .catch(
            err => res.send(err)
        )
})
module.exports = router