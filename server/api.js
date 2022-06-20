module.exports = function (app, db) {
	const jwt = require('jsonwebtoken')

	app.post('/api/register', async function (req, res, next) {
		try {
			const { username } = req.body;
		const { password } = req.body;
		let loveCounter = 0
		
		const token = jwt.sign({
			username
		}, process.env.ACCESS_TOKEN_SECRET);

		let checkDuplicate = await db.manyOrNone(`SELECT id from love_user WHERE username = $1`, [username]);

		if (checkDuplicate.length < 1) {
		await db.none(`insert into love_user (username, password, love_count) values ($1, $2, $3)`, [username, password, loveCounter])
		}

		res.json({
			token,
			data: await db.manyOrNone("select * from love_user")
		});
		} catch (error) {
			console.log(error);
		}

	})
	app.post('/api/login', async function (req, res, next) {
		// try {
		const { username } = req.body;
		const { password } = req.body;
		
		let checkPassword = await db.oneOrNone(`SELECT password from love_user WHERE username = $1`, [username]);

		if (checkPassword.password === password) {
			
			res.json({
				message: 'success'
			});
		}
		// } catch (error) {
		// 	console.log(error);
		// }

	})
	app.post('/api/hearts', async function (req, res, next) {
		try {
			const { username } = req.body;
		
		await db.none(`UPDATE love_user SET love_count = love_count + 1 WHERE username = $1`, [username])

		// res.json({
		// 	data: await db.manyOrNone("select * from love_user")
		// });
		} catch (error) {
			console.log(error);
		}

	})
	app.get('/api/hearts/:username', async function (req, res, next) {
		try {
			let hearts
			const { username } = req.params;
			let love_count = await db.one(`select love_count from love_user WHERE username = $1`, [username])
			if (love_count.love_count <= 0) {
				return "💔"
			}
	
		  if (love_count.love_count > 0 && love_count.love_count <= 5) {
			hearts = "💚"
		  } else if (love_count.love_count <= 10) {
			hearts = "💚💚";
		  } else {
			hearts = "💚💚💚";
		  }
		res.json({
			data: hearts
		});
		} catch (error) {
			console.log(error);
		}

	})
	// function verifyToken(req, res, next) {

	// 	const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
	// 	if (!req.headers.authorization || !token) {
	// 		res.sendStatus(401);
	// 		return;
	// 	}
	// 	const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

	// 	const { username } = decoded;

	// 	if (username && username === process.env.USERNAME) {
	// 		next();
	// 	} else {
	// 		res.status(403).json({
	// 			message: 'unauthorized'
	// 		});
	// 	}

	// }
}