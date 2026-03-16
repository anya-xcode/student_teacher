const mongoose = require('mongoose');
require('dotenv').config();

const assignmentSchema = new mongoose.Schema({
  teacher: mongoose.Schema.Types.ObjectId,
});

const userSchema = new mongoose.Schema({
  email: String,
  role: String
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
const User = mongoose.model('User', userSchema);

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const teacher = await User.findOne({ email: 'teacher@gmail.com' });
  if (!teacher) {
    console.log('Teacher user not found. Please run seed first.');
    process.exit(1);
  }

  const result = await Assignment.updateMany({}, { $set: { teacher: teacher._id } });
  console.log(`Updated ${result.modifiedCount} assignments to current Teacher ID: ${teacher._id}`);

  await mongoose.disconnect();
}

fix();
