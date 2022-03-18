const { Sequelize, DataTypes } = require("sequelize");

// 从环境变量中读取数据库配置
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "" } = process.env;

const [host, port] = MYSQL_ADDRESS.split(":");

const sequelize = new Sequelize("nodejs_demo", MYSQL_USERNAME, MYSQL_PASSWORD, {
  host,
  port,
  dialect: "mysql", /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
  // 连接池
  // pool: {
  //   max: 5,
  //   min: 0,
  //   acquire: 30000,
  //   idle: 10000
  // },
  // 数据表全局配置
  // define: {
  //   //是否冻结表名,最好设置为true，要不sequelize会自动给表名加上复数s造成查询数据失败。
  //   //mongoose也有这样的问题...
  //   freezeTableName: true,
  //   // 是否为表添加 createdAt 和 updatedAt 字段
  //   // createdAt 记录表的创建时间
  //   // updatedAt 记录字段更新时间
  //   timestamps: false,
  //   // 是否为表添加 deletedAt 字段
  //   // 在日常开发中删除数据记录是一大禁忌，因此我们删除数据并不会真正删除，而是为他添加
  //   // deletedAt字段
  //   paranoid: false,
  //   //是否开启op
  //   operatorsAliases: false
  // },
  // // 时区
  // timezone: '+08:00'
});

// const Model = Sequelize.Model;

// class UserInfo extends Model { }


// 定义数据模型
const Counter = sequelize.define("Counter", {
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});


const UserInfo = sequelize.define("UserInfo", {
  id: {
    type: DataTypes.INTEGER, // 要与数据库声明的类型匹配
    autoIncrementIdentity: true, // 自增
    primaryKey: true, // 主键
  },
  name: {
    type: DataTypes.CHAR,
    allowNull: true
  },
  age: {
    type: DataTypes.CHAR,
    allowNull: true
  },
  phone: {
    type: DataTypes.CHAR,
    allowNull: true
  },
  class: {
    type: DataTypes.CHAR,
    allowNull: true
  },
  major: {
    type: DataTypes.CHAR,
    allowNull: true
  },
});
// 数据库初始化方法
async function init() {
  await Counter.sync({ alter: true });
  await UserInfo.sync({ alter: true });
}


// 导出初始化方法和模型
module.exports = {
  init,
  Counter,
  UserInfo
};
