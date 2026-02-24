import express from "express";
import { exec } from "child_process";

const app = express();
app.use(express.json());

app.post("/deploy", (req, res) => {
  console.log("🚀 GitHub push received");

  exec("deploy.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    console.log(`✅ Output: ${stdout}`);
    console.error(`⚠️ ${stderr}`);
  });

  res.send("Deployment triggered");
});

app.listen(9000, () => {
  console.log("Webhook running on port 9000");
});