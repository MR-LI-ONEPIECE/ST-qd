const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const {
  init: initDB,
  Counter,
  UserInfo,
  SignIn,
  Login,
  Activity,
} = require("./db");

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
    res.send({
      code: 0,
      data: req.headers["x-wx-openid"],
    });
  }
});

// 提交用户信息列表
app.post("/api/userInfo", async (req, res) => {
  const result = req.body;
  try {
    const userInfo = await UserInfo.upsert(result, { validate: true });

    res.send({
      code: 0,
      data: userInfo,
    });
  } catch (error) {
    res.send({
      code: 400,
      error: error,
    });
    return;
  }
});
//获取用户列表
app.get("/api/userInfo", async (req, res) => {
  try {
    const userList = await UserInfo.findAll();

    res.send({
      code: 0,
      data: userList,
    });
  } catch (error) {
    res.send({
      code: 400,
      error: error,
    });
  }
});

//更改用户信息
app.post("/api/update/userInfo", async (req, res) => {
  const result = req.body;
  try {
    await UserInfo.upsert(result, { validate: true });
    res.send({
      code: 0,
      data: result,
    });
  } catch (error) {
    res.send({
      code: 400,
      error: error,
    });
  }
});

//删除用户信息
app.delete("/api/userInfo", async (req, res) => {
  const result = req.body;
  try {
    await UserInfo.destroy({
      where: {
        openId: result.openId,
      },
    });
    res.send({
      code: 0,
      data: result,
    });
  } catch (error) {
    res.send({
      code: 400,
      error: error,
    });
  }
});

//学生签到
app.post("/api/signIn", async (req, res) => {
  const result = req.body;
  try {
    await SignIn.create(result);
    const userInfo = await UserInfo.findOne({
      where: {
        openId: result.openId,
      },
    });
    const newUserInfo = {
      ...userInfo.dataValues,
      credit: userInfo.dataValues.credit + 1,
    };
    await UserInfo.upsert(newUserInfo, { validate: true });
    res.send({
      code: 0,
      data: newUserInfo,
    });
  } catch (error) {
    res.send({
      code: 400,
      error: error,
    });
    return;
  }
});

//获取某个学生签到列表
app.get("/api/signIn", async (req, res) => {
  const result = req.query;

  try {
    const signInList = await SignIn.findAll({
      where: {
        openId: result.openId,
        activityId: result.activityId,
      },
    });

    res.send({
      code: 0,
      data: signInList,
    });
  } catch (error) {
    res.send({
      code: 400,
      error: error,
      data: result,
    });
  }
});

//获取所有学生签到列表
app.get("/api/signInAll", async (req, res) => {
  SignIn.findAll({
    include: [{ model: UserInfo, attributes: ["name"] }],
  })
    .then((data) => {
      res.send({
        code: 0,
        data,
      });
    })
    .catch((error) => {
      res.send({
        code: 400,
        error: error,
      });
    });
});

//获取活动列表
app.get("/api/activity", async (req, res) => {
  const result = req.query;

  try {
    const dataList = await Activity.findAll();

    res.send({
      code: 0,
      data: dataList,
    });
  } catch (error) {
    res.send({
      code: 400,
      error: error,
      data: result,
    });
  }
});

//添加活动
app.post("/api/activity", async (req, res) => {
  const result = req.query;

  try {
    const dataList = await Activity.create(result);
    res.send({
      code: 0,
      data: dataList,
    });
  } catch (error) {
    res.send({
      code: 400,
      error: error,
      data: result,
    });
  }
});

//登陆
app.post("/api/login", async (req, res) => {
  const result = req.body;

  try {
    const data = await Login.findOne({
      where: {
        username: result.username,
        password: result.password,
      },
    });
    if (data) {
      res.send({
        code: 0,
        data: data,
      });
    } else {
      res.send({
        code: 400,
        error: "账号或密码错误",
      });
    }
  } catch (error) {
    res.send({
      code: 400,
      error: error,
    });
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
