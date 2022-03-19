const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter, UserInfo, SignIn } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

// 提交用户信息列表
app.post("/api/userInfo", async (req, res) => {
  const result = req.body;
  console.log(result)
  try {
    await UserInfo.create(result)
  } catch (error) {
    res.send({
      code: 400,
      error: error
    })
    return
  }

  res.send({
    code: 200,
    data: result
  })

})
//获取用户列表
app.get("/api/userInfo", async (req, res) => {

  try {
    const userList = await UserInfo.findAll();

    console.log(userList)
    res.send({
      code: 200,
      data: userList
    })
  } catch (error) {
    res.send({
      code: 400,
      error: error
    })
  }
})

//学生签到
app.post("/api/signIn", async (req, res) => {
  const result = req.body;
  console.log(result)
  try {
    await SignIn.create(result)
  } catch (error) {
    res.send({
      code: 400,
      error: error
    })
    return
  }
  res.send({
    code: 200,
    data: result
  })

})

//获取学生签到列表
app.get("/api/signIn", async (req, res) => {
  const result = req.body
  try {
    const signInList = await SignIn.findAll();

    console.log(signInList)
    res.send({
      code: 200,
      data: signInList
    })
  } catch (error) {
    res.send({
      code: 400,
      error: error
    })
  }
})

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();