const mongoose = require("mongoose");

// 2202指的是数据库的名字
mongoose.connect("mongodb://localhost:27017/2202");

const Schema = mongoose.Schema;
// 用户模块有三个字段
const userSchema = new Schema({
	imgurl: String,
	username: String,
	password: String,
});

//第一个参数表示模型名字，将来用于多表关联使用，第二个参数将来数据库集合中的
// 字段，第三个参数表示数据库集合的表名字。如果不写第三个参数的话，将来在数据库
// 中会以第一个参数的复数作为表的名字
const User = mongoose.model("User", userSchema, "user");

// 导出User
module.exports = User;
