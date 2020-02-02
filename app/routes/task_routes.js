const express = require('express')

const router = express.Router()

const {Task} = require ('../models/task') //add new task 
const {User} = require('../models/user')

const requireOwnership = customErrors.requireOwnership;

const handle404 = customErrors.handle404
// import passport 

const passport = require('passport');
//JWT
const requireToken = passport.authenticate('bearer', {session:false})

//Index 

//GET // tasks

router.get('/tasks', requireToken, (req,res,next) => {
    const userId = req.user._id;
    Task.find({'owner': userId})
    .then( tasks => { 
        res.status(200).json({tasks:tasks}); 

    })
    .catch(next)


})
//CREATE

router.post('/tasks', requireToken, (req,res,next)=>{
    const newTask = new Task(req.body.task)
    const user = User.update(
        {_id: req.user._id},
        {$push: {tasks: newTask}} //
    )
    .then(
        processDetail => console.log(process)
    )
    .catch(
        err => console.log(err)
    )
    // const userId = req.user._id;
    
    // newTask.admin = userId;

    // Task.create(newTask)
    // .then( task => { 
    //     res.status(201).json({task:task})
    // })
    // .catch(next)
})


//SHOW
//GET -- /tasks/:id

router.get('/tasks:id', requireToken,(req,res, next)=>{
    const taskId = req.params.id;

    Task.findById(taskId)
    .then( task => {
        requireOwnership( req, task)
        res.status(200).json({
            task:task
        })
    })
    .catch(next)

})
//Update an existing task 
//PATCH / tasks/:id
router.patch('/tasks/:id', requireToken , (req,res,next)=>{

    const taskId = req.params.id;
    const updateTask = req.body.task;
    Task.findById(taskId, updateTask) 
    .then( (task) => {
        requireOwnership(req,task)

        return task.update(updateTask)
    })
    .then( ()=>res.status(204))
    .catch(next)


})

//Delete --DESTROY a task
router.delete('tasks/taskid',requireToken,(req,res,next)=>{

    const taskId = req.params.taskId;

    Task.findbyId(taskId)

    .then(
        task => {
            requireOwnership (req,task)
            return task.remove()

        }
    )
    .then(()=>res.sendStatus(204))
    .catch(next)
} )

module.exports = router