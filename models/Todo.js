import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // createdAt과 updatedAt을 자동으로 관리
});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
