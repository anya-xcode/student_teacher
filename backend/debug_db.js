const mongoose = require('mongoose');
require('dotenv').config();

const assignmentSchema = new mongoose.Schema({
  title: String,
  teacher: mongoose.Schema.Types.ObjectId,
  status: String
});

const userSchema = new mongoose.Schema({
  email: String,
  role: String
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
const User = mongoose.model('User', userSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- USERS ---');
  const users = await User.find({});
  users.forEach(u => console.log(`${u.email} (${u.role}): ${u._id}`));

  console.log('\n--- ASSIGNMENTS ---');
  const assignments = await Assignment.find({});
  assignments.forEach(a => console.log(`${a.title} [Status: ${a.status}] - Teacher ID: ${a.teacher}`));

  await mongoose.disconnect();
}

check();
