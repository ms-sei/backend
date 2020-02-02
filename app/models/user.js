const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  title:{
      type: String
  },
  description:{
      type: String
  }
},{
  timestamps:true
})

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  tasks:[taskSchema],
  token: String
}, {
  timestamps: true,
  toObject: {
    // remove `hashedPassword` field when we call `.toObject`
    transform: (_doc, user) => {
      delete user.hashedPassword
      return user
    }
  }
})

userSchema.virtual('examples', {
  ref: 'Example',
  localField: '_id',
  foreignField: 'owner'
});

const User = mongoose.model('User', userSchema)
const Task = mongoose.model("Task", taskSchema)

module.exports = { User, Task }