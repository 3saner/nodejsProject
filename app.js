const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
// 导入数据库User
const User = require("./model/user.js");

const app = new express();

// 设置multer
// 指的是将来存放的磁盘路径
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// 当前目录下面的统计的uploads目录
		cb(null, "uploads");
	},
	// 请求发过来的图片设置的文件名字
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
	},
});
const upload = multer({ storage: storage });

// 使用body-parse设置请求来的编码格式
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// 设置ejs模板引擎
app.set("view engine", "ejs");
// 设置静态路径
app.use(express.static("uploads"));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// 注册页面渲染
app.get("/register", (req, res) => {
	// 默认读取views下的register.ejs文件
	res.render("register");
});
// 登陆页面渲染
app.get("/login", (req, res) => {
	// 默认读取views下的login.ejs文件
	res.render("login");
});
// 首页页面渲染
app.get("/", (req, res) => {
	res.render("home");
});
// 详情页
app.get("/detail", (req, res) => {
	// 获取？后面的参数字符串
	// console.log(req.query);
	// let id = req.query.id;
	res.render("detail");
});
// 修改页
app.get("/updataUser", (req, res) => {
	res.render("updataUser");
});

// 处理注册
app.post("/doregister", async (req, res) => {
	// 打印接收过来的模块
	// { username: '123456', password: '123' }
	console.log(req.body);
	// 在数据库中找是否有username一样，有，说明checked的长度大于0.
	const checked = await User.find({ username: req.body.username });
	// 说明存在
	if (checked.length > 0) {
		res.json({
			code: 201,
			msg: "用户名已注册",
		});
	} else {
		// 没有就插入数据库
		const user = new User(req.body);
		// 保存到数据库
		const result = await user.save();
		// 如果result有值，说明保存成功。
		if (result) {
			res.json({
				code: 200,
				msg: "用户注册成功",
			});
		}
	}
});

// 检测用户名是否存在
app.post("/checkname", async (req, res) => {
	console.log(req.body);
	// 从数据库找是否有该用户名存在
	let result = await User.find({ username: req.body.username });
	console.log(result);
	if (result.length > 0) {
		res.json({
			code: 200,
			msg: "用户名正确",
		});
	} else {
		res.json({
			code: 203,
			msg: "用户名不存在",
		});
	}
});

// 处理登录
app.post("/doLogin", async (req, res) => {
	// 请求过来的数据
	console.log(req.body);
	// 查找数据库，看看此用户是否存在，用户名和密码都正确，才正确
	const result = await User.find(req.body); //根据用户名和密码查找对应的数据，返回一个数组
	// true 看result是不是数组
	console.log(result instanceof Array);
	// 大于0说明找到了，有该用户存在。
	if (result.length > 0) {
		res.json({
			code: 200,
			msg: "用户登陆成功",
		});
	} else {
		res.json({
			code: 201,
			msg: "用户或密码错误",
		});
	}
});

// 首页显示用户列表
app.get("/users", async (req, res) => {
	// 查找所有的用户
	const result = await User.find();
	// console.log("result", result);
	// 说明有数据
	if (result.length > 0) {
		res.json({
			code: 200,
			msg: "存在用户数据",
			// 获取到result数组的数据
			users: result,
		});
	} else {
		// 说明没数据
		res.json({
			code: 201,
			msg: "没有数据",
			users: [],
		});
	}
});

// 根据id获取对应的数据
app.get("/detail/:id", async (req, res) => {
	console.log(req.params.id); //req.params.id可以获取动态id参数
	const _id = req.params.id;
	const result = await User.findById(_id);
	console.log(result); //返回对应的数据
	if (result) {
		res.json({
			code: 200,
			msg: "获取详情成功",
			user: result,
		});
	} else {
		res.json({
			code: 203,
			msg: "查找的id不存在",
		});
	}
});

// 根据id获取对应的数据（服务端渲染）
/* app.get("/detail/:id", async (req, res) => {
	const id = req.params.id;
	// console.log(id);
	const result = await User.findById(id);
	console.log(222, result);
	if (result) {
		// 找到数据
		res.render("detail", {
			user: result,
		});
	} else {
		// 这种情况表示没有找到数据
		res.render("detail");
	}
}); */

// 删除用户 这里使用delete的方法
app.delete("/deleteuser/:id", async (req, res) => {
	// console.log(req.params.id);
	const id = req.params.id;
	// 通过id删除他
	const result = await User.findByIdAndDelete(id);
	// console.log(result);
	if (result) {
		res.json({
			code: 200,
			msg: "用户删除成功",
		});
	} else {
		res.json({
			code: 205,
			msg: "用户删除失败",
		});
	}
});

// 根据id获取用户 修改页面
app.get("/updataUser/:id", async (req, res) => {
	console.log(req.params.id);
	let id = req.params.id;
	const result = await User.findById(id);
	console.log(result);
	if (result) {
		res.json({
			code: 200,
			msg: "获取用户信息成功",
			user: result,
		});
	} else {
		res.json({
			code: 201,
			msg: "获取用户信息失败",
		});
	}
});

// 修改用户
app.put("/updataUser1/:id", async (req, res) => {
	console.log(req.params.id);
	let id = req.params.id;
	let result = await User.findByIdAndUpdate(id, req.body);
	if (result) {
		res.json({
			code: 200,
			msg: "修改成功",
		});
	} else {
		res.json({
			code: 201,
			msg: "修改失败",
		});
	}
});

// 修改页面

// 图片上传
app.post("/upload", upload.single("avatar"), function (req, res, next) {
	/* 
	{
	fieldname: 'avatar',
	originalname: 'nana.jpeg',
	encoding: '7bit',
	mimetype: 'image/jpeg',
	destination: 'uploads',
	filename: 'avatar-1651890268245-nana.jpeg',
	path: 'uploads\\avatar-1651890268245-nana.jpeg',
	size: 74755
	}
	*/
	// 上传的图片的信息
	console.log(req.file);
	// req.file is the `avatar` file
	// req.body will hold the text fields, if there were any
	res.json({
		code: 200,
		msg: "图片上传成功",
		path: req.file.path,
	});
});

app.listen(8888);
