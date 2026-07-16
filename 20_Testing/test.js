const mongoose = require("mongoose");

const uri =
  "mongodb+srv://gmadhav3122_db_user:Goyalgunhouse@cluster1.hkv58sh.mongodb.net/ai_interview_simulator?retryWrites=true&w=majority&appName=cluster1";

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ Connected Successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });