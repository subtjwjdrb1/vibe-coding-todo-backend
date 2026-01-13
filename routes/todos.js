import express from 'express';
import Todo from '../models/Todo.js';

const router = express.Router();

// 모든 할일 조회 라우터
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error('할일 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 특정 할일 조회 라우터
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ error: '할일을 찾을 수 없습니다.' });
    }

    res.json(todo);
  } catch (error) {
    console.error('할일 조회 오류:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: '잘못된 ID 형식입니다.' });
    }
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 할일 생성 라우터
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    // title이 없으면 에러
    if (!title) {
      return res.status(400).json({ error: '제목(title)은 필수입니다.' });
    }

    // 새 할일 생성
    const newTodo = new Todo({
      title,
      description: description || ''
    });

    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('할일 생성 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 할일 수정 라우터
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    // 업데이트할 데이터 구성
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = completed;

    // 업데이트할 필드가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: '수정할 데이터가 없습니다.' });
    }

    // 할일 찾아서 업데이트
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // 할일이 없으면 에러
    if (!updatedTodo) {
      return res.status(404).json({ error: '할일을 찾을 수 없습니다.' });
    }

    res.json(updatedTodo);
  } catch (error) {
    console.error('할일 수정 오류:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: '잘못된 ID 형식입니다.' });
    }
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 할일 삭제 라우터
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedTodo = await Todo.findByIdAndDelete(id);

    // 할일이 없으면 에러
    if (!deletedTodo) {
      return res.status(404).json({ error: '할일을 찾을 수 없습니다.' });
    }

    res.json({ message: '할일이 성공적으로 삭제되었습니다.', todo: deletedTodo });
  } catch (error) {
    console.error('할일 삭제 오류:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: '잘못된 ID 형식입니다.' });
    }
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
