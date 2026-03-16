require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Mongoose Models ────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], required: true },
});
const User = mongoose.model('User', userSchema);

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Draft', 'Published', 'Completed'], default: 'Draft' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
const Assignment = mongoose.model('Assignment', assignmentSchema);

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answer: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  reviewed: { type: Boolean, default: false },
});
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
const Submission = mongoose.model('Submission', submissionSchema);

// ─── Auth Middleware ────────────────────────────────────────────────────────────

const auth = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (roles.length && !roles.includes(decoded.role))
      return res.status(403).json({ message: 'Forbidden' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ─── Auth Routes ────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ message: 'User registered', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Assignment Routes ──────────────────────────────────────────────────────────

// GET assignments — teacher sees own (filterable), student sees Published only
app.get('/api/assignments', auth(), async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'teacher') {
      filter.teacher = req.user.id;
      if (req.query.status) filter.status = req.query.status;
    } else {
      filter.status = 'Published';
    }
    const assignments = await Assignment.find(filter).sort({ createdAt: -1 });

    // Attach submission counts for teacher, or own submission for student
    const result = await Promise.all(
      assignments.map(async (a) => {
        const obj = a.toObject();
        if (req.user.role === 'teacher') {
          obj.submissionCount = await Submission.countDocuments({ assignment: a._id });
        } else {
          const sub = await Submission.findOne({ assignment: a._id, student: req.user.id });
          obj.mySubmission = sub || null;
        }
        return obj;
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE assignment (teacher only)
app.post('/api/assignments', auth(['teacher']), async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    if (!title || !description || !dueDate)
      return res.status(400).json({ message: 'Title, description, and due date are required' });
    const assignment = await Assignment.create({
      title, description, dueDate, teacher: req.user.id,
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE assignment (teacher only, Draft only)
app.put('/api/assignments/:id', auth(['teacher']), async (req, res) => {
  try {
    const a = await Assignment.findOne({ _id: req.params.id, teacher: req.user.id });
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    if (a.status !== 'Draft')
      return res.status(400).json({ message: 'Only Draft assignments can be edited' });
    Object.assign(a, req.body);
    await a.save();
    res.json(a);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHANGE STATUS (teacher only): Draft→Published→Completed
app.patch('/api/assignments/:id/status', auth(['teacher']), async (req, res) => {
  try {
    const a = await Assignment.findOne({ _id: req.params.id, teacher: req.user.id });
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    const transitions = { Draft: 'Published', Published: 'Completed' };
    const next = transitions[a.status];
    if (!next || next !== req.body.status)
      return res.status(400).json({ message: `Cannot transition from ${a.status} to ${req.body.status}` });
    a.status = next;
    await a.save();
    res.json(a);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE assignment (teacher only, Draft only)
app.delete('/api/assignments/:id', auth(['teacher']), async (req, res) => {
  try {
    const a = await Assignment.findOne({ _id: req.params.id, teacher: req.user.id });
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    if (a.status !== 'Draft')
      return res.status(400).json({ message: 'Only Draft assignments can be deleted' });
    await a.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Submission Routes ──────────────────────────────────────────────────────────

// GET submissions for an assignment (teacher only)
app.get('/api/assignments/:id/submissions', auth(['teacher']), async (req, res) => {
  try {
    const subs = await Submission.find({ assignment: req.params.id }).populate('student', 'name email');
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SUBMIT answer (student only, one per assignment, checks due date)
app.post('/api/assignments/:id/submit', auth(['student']), async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a || a.status !== 'Published')
      return res.status(400).json({ message: 'Assignment not available for submission' });
    if (new Date() > new Date(a.dueDate))
      return res.status(400).json({ message: 'Submission deadline has passed' });
    if (!req.body.answer?.trim())
      return res.status(400).json({ message: 'Answer is required' });
    const existing = await Submission.findOne({ assignment: a._id, student: req.user.id });
    if (existing)
      return res.status(400).json({ message: 'You have already submitted for this assignment' });
    const sub = await Submission.create({
      assignment: a._id, student: req.user.id, answer: req.body.answer,
    });
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET own submission (student only)
app.get('/api/assignments/:id/my-submission', auth(['student']), async (req, res) => {
  try {
    const sub = await Submission.findOne({ assignment: req.params.id, student: req.user.id });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MARK submission as reviewed (teacher only)
app.patch('/api/submissions/:id/review', auth(['teacher']), async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    sub.reviewed = true;
    await sub.save();
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Start Server ───────────────────────────────────────────────────────────────

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
}).catch(err => console.error('MongoDB connection error:', err));
