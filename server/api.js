module.exports = function (app, db) {
	const jwt = require('jsonwebtoken')
	const bcrypt = require('bcrypt');
	const saltRounds = 10;

	function verifyToken(req, res, next) {
		const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
		if (!req.headers.authorization || !token) {
			res.sendStatus(401);
			return;
		}
		try {
			const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
			const { username } = decoded;

			if (username) {
				next();
			} else {
				res.status(403).json({
					message: 'unauthorized'
				});
			}
		} catch (err) {
			if (err && 500) {
				res.json({
					message: 'expired'
				})
			}
			next()


		}

	}

	/**
	 * 
	 * @param {*} username - username from logged in user
	 * @return {Object} - user data
	 */
	async function getUserByUsername(username) {
		return await db.oneOrNone(`SELECT * from love_user WHERE username = $1`, [username]);
	}

	function getHearts(love_count) {
		if (love_count <= 0) {
			hearts = "💔"
		} else if (love_count > 0 && love_count <= 5) {
			hearts = "💚"
		} else if (love_count <= 10) {
			hearts = "💚💚";
		} else {
			hearts = "💚💚💚";
		}
		return hearts
	}

	app.post('/api/register', async function (req, res, next) {
		const { username } = req.body;
		const { password } = req.body;
		let loveCounter = 0

		let checkDuplicate = await db.manyOrNone(`SELECT id from love_user WHERE username = $1`, [username]);
		bcrypt.genSalt(saltRounds, async function (err, salt) {
			bcrypt.hash(password, salt, async function (err, hash) {
				// Store hash in your password DB.
				if (checkDuplicate.length < 1) {
					await db.none(`insert into love_user (username, password, love_count) values ($1, $2, $3)`, [username, hash, loveCounter])
					res.json({
						message: 'success'
					});
				} else {
					res.json({
						message: 'duplicate'
					});
				}
			});
		});

	})
	app.post('/api/login', async function (req, res, next) {
		const { username } = req.body;
		const { password } = req.body;
		const token = jwt.sign({
			username
		}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '4hr' });
		let checkUser = await db.manyOrNone(`SELECT id from love_user WHERE username = $1`, [username]);
		if (checkUser.length < 1) {
			res.json({
				token,
				message: 'unregistered'
			});
		} else {

			let checkPassword = await db.oneOrNone(`SELECT password from love_user WHERE username = $1`, [username]);

			const match = await bcrypt.compare(password, checkPassword.password);

			if (match) {
				res.json({
					token,
					message: 'success'
				});
			} else {
				res.json({
					token,
					message: 'unmatched'
				});
			}
		}
	});



	app.post('/api/hearts', async function (req, res, next) {
		try {
			const { username } = req.body;

			await db.none(`UPDATE love_user SET love_count = love_count + 1 WHERE username = $1`, [username])
			const user = await getUserByUsername(username)

			const hearts = getHearts(user.love_count)

			res.json({
				data: hearts
			});
		} catch (error) {
			console.log(error);
			res.status(500)
				.json(error)
		}

	})

	app.post('/api/hearts/decrease', async function (req, res, next) {
		try {
			const { username } = req.body;
			let checkLoveCount = await db.oneOrNone(`SELECT love_count from love_user WHERE username = $1`, [username]);


				if (checkLoveCount.love_count > 0) {
					await db.none(`UPDATE love_user SET love_count = love_count - 1 WHERE username = $1`, [username])
				} 
		
			const user = await getUserByUsername(username)
			console.log(user, `user`);
			const hearts = getHearts(user.love_count)
			
			res.json({
				data: hearts
			});

		} catch (error) {
			console.log(error);
		}

	})


	app.get('/api/hearts/:username', verifyToken, async function (req, res, next) {
		try {
			let hearts
			const { username } = req.params;
			
			let love_count = await db.oneOrNone(`select love_count from love_user WHERE username = $1`, [username])
			if (love_count){
				if (love_count.love_count <= 0) {
					hearts = "💔"
				} else if (love_count.love_count > 0 && love_count.love_count <= 5) {
					hearts = "💚"
				} else if (love_count.love_count <= 10) {
					hearts = "💚💚";
				} else {
					hearts = "💚💚💚";
				}
				res.json({
					data: hearts
				});
			}

		} catch (error) {

			console.log(error);
		}

	})

}