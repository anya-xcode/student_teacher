require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['teacher', 'student'] },
});
const User = mongoose.model('User', userSchema);

const users = [
 {
  name: "Teacher",
  email: "teacher@gmail.com",
  password: "teacher@123",
  role: "teacher"
 },
 {
  name: "Student",
  email: "student@gmail.com",
  password: "student@123",
  role: "student"
 }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteMany({});
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      u.password = await bcrypt.hash(u.password, 10);
      await User.create(u);
      console.log(`Created: ${u.email}`);
    } else {
      console.log(`Exists: ${u.email}`);
    }
  }
  console.log('Seeding done');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
