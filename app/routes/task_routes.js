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
    res.status(200).json({tasks:req.user.tasks})
})
// CREATE
router.post('/tasks', requireToken, (req,res,next)=>{
    let bodyTask = req.body; // received the task
    const userId = req.user._id;  //received the Id of who made the current task!!
    bodyTask.from = userId

    const newTask = new Task(bodyTask)
    //  console.log(req.body)
    User.updateOne(
        {_id: newTask.owner}, //assigned to user's 
        {$push: {tasks: newTask}}
    )
    .then(
        () => res.sendStatus(204)
    )
    .catch(
        err => res.status(400).send(err)
    )
})
 //show a specific task by a specific user
router.get('/tasks/:id', requireToken,(req, res)=> {
    // console.log('xx')
    const task =  req.user.tasks.find(task => String(task._id) === req.params.id)
    const owner = task.owner;
    const from = task.from
    User.findById(owner)
    .then(user => {
        // task.email = user.email
        User.findById(from)
        .then(u => {
            res.status(200).json({
                task:task,
                user:{
                    from:u.email,
                    owner:user.email
                }})
        })
    })
    .catch(err => console.log(err))
   

})
//edit update
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

// Delete --DESTROY a task
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