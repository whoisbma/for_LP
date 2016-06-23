var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/rpgdata');

var bodyParser = require('body-parser');

var express = require('express');
var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

db.serialize(function() {
	var questions =	[
					"Should we do the thing?",
					"Should we build more schools?",
					"Should we build a cool spaceship?"
					];

	var questionTokens =	[
							"0,1,3",
							"1,2",
							"0"
							];

	var questionsYes =	[
						"10,5,1",
						"-1,15",
						"3"
						];

	var questionsNo =	[
						"-5,-3,-10",
						"-4,3",
						"-2"
						];

	var tokens = 	[
					"Moneys",
					"Schoolings",
					"Space",
					"Smarts"
				 	];

	db.run("CREATE TABLE IF NOT EXISTS questions (id INTEGER, contents TEXT, tokens TEXT, yes TEXT, no TEXT)");
	db.all("SELECT * FROM questions", function(err, rows) {
		if (rows.length < 1) {
			for (var i = 0; i < questions.length; i++) {
				db.run("INSERT INTO questions (id, contents, tokens, yes, no) VALUES (?, ?, ?, ?, ?)", i, questions[i], questionTokens[i], questionsYes[i], questionsNo[i]);
			}
		}
	});

	db.run("CREATE TABLE IF NOT EXISTS tokens (id INTEGER, contents TEXT)");
	db.all("SELECT * FROM tokens", function(err, rows) {
		if (rows.length < 1) {
			for (var i = 0; i < tokens.length; i++) {
				db.run("INSERT INTO tokens (id, contents) VALUES (?, ?)", i, tokens[i]);
			}
		}
	});
	
	db.all("SELECT * FROM questions", function(err, rows) {
		console.log("\nquestions:\n" );
		console.log(rows);
	});

	db.all("SELECT * FROM tokens", function(err, rows) {
		console.log("\ntokens:\n");
		console.log(rows);
	});
});

//serve json for questions
app.get('/data/questions', function(req, res) {
	console.log("GET received for questions");
	db.all("SELECT * FROM questions", function(err, rows) {
		console.log(rows);
		try {
			var response = [];
			for (var i = 0; i < rows.length; i++) {
				response[i] = {
					"id" : rows[i].id,
					"contents" : rows[i].contents,
					"tokens" : rows[i].tokens,
					"yes" : rows[i].yes,
					"no" : rows[i].no
				};
			}
			res.json(response);
		} catch (exeception) {
        	res.send(404);
		}
	});
});

app.get('/data/questions/:n', function(req, res) {
	console.log("\nGET received for question " + req.params.n);
	db.get("SELECT * FROM questions WHERE id=?", req.params.n, function(err, row) {
		console.log(row);
		try {
			var response = {
				"id" : row.id,
				"contents" : row.contents,
				"tokens" : row.tokens,
				"yes" : row.yes,
				"no" : row.no
			};
			res.json(response);
		} catch (exeception) {
        	res.send(404);
		}
	});
});

//serve json for tokens
app.get('/data/tokens', function(req, res) {
	console.log("GET received for tokens");
	db.all("SELECT * FROM tokens", function(err, rows) {
		console.log(rows);
		try {
			var response = [];
			for (var i = 0; i < rows.length; i++) {
				response[i] = {
					"id" : rows[i].id,
					"contents" : rows[i].contents
				};
			}
			res.json(response);
		} catch (exception) {
			res.send(404);
		}
	});
});

app.get('/data/tokens/:n', function(req, res) {
	console.log("\nGET received for token " + req.params.n);
	db.get("SELECT * FROM tokens WHERE id=?", req.params.n, function(err, row) {
		console.log(row);
		try {
			var response = {
				"contents" : row.contents,
				"id" : row.id
			};
			res.json(response);
		} catch (exception) {
			res.send(404);
		}
	});
});


//add new question
app.post('/data/questions', function(req, res){
	/*
	schema for new question
		{
			"id" : the id number ~~~~should be automated.~~~~~
			"contents" : the text of the question,
			"tokens" : a comma separated string of which token ids the question has a relationship to,
			"yes" : comma separated string of values for Yes answers to above tokens,
			"no" : comma separated string of values for No answers to above tokens
		}
	e.g.
	curl -H "Content-Type: application/json" -d '{"id" : 99, "contents": "do you like cheese", "tokens" : "1,2,3", "yes" : "3,2,1", "no" : "-1,-2,-3"}' http://127.0.0.1:3000/data/questions
	*/

	//insert new field if there are all fields set
	console.log("\nPOST to add new question received:\n");
	console.log("req.body: " + req.body.contents);
	db.run("INSERT INTO questions (id, contents, tokens, yes, no) VALUES (?, ?, ?, ?, ?)", 
		req.body.id, req.body.contents, req.body.tokens, req.body.yes, req.body.no);
	res.end();
});

//add new token
app.post('/data/tokens', function(req, res){
	/*
	schema for new token
		{
			"id" : the id number ~~~~should be automated.~~~~~
			"contents" : the text of the token
		}
	e.g.
	curl -H "Content-Type: application/json" -d '{"id" : 100, "contents": "cheesiness"}' http://127.0.0.1:3000/data/tokens
	*/
	console.log("\nPOST to add new token received:\n");
	console.log("req.body: " + req.body.contents);
	db.run("INSERT INTO tokens (id, contents) VALUES (?, ?)", 
		req.body.id, req.body.contents);
	res.end();
});

//delete question
// curl -X DELETE http://127.0.0.1:3000/data/questions/:n
app.delete('/data/questions/:n', function(req, res) {
	console.log("\nDELETE received for " + req.params.n + " question\n");
	db.run("DELETE FROM questions WHERE id=?", req.params.n, function(err, row) {
		if (err) {
			console.log(err);
			res.status(500);
		} else {
			res.status(202);
		}
	});
	res.end();
});

//delete token
// curl -X DELETE http://127.0.0.1:3000/data/tokens/:n
app.delete('/data/tokens/:n', function(req, res) {
	console.log("\nDELETE received for " + req.params.n + " token\n");
	db.run("DELETE FROM tokens WHERE id=?", req.params.n, function(err, row) {
		if (err) {
			console.log(err);
			res.status(500);
		} else {
			res.status(202);
		}
	});
	res.end();
});

//update question
//curl -X PUT http://127.0.0.1:3000/data/questions/1 -H "Content-Type: application/json" -d '{"contents" : "some other new question??", "tokens":"1,2,3,5", "yes":"1,2,3,4","no":"0,0,0,0"}'
app.put('/data/questions/:n', function(req, res) {
	console.log('PUT request for id of question ' + req.params.n + "\n");
	// res.send('PUT request for id of token ' + req.params.n + "\n");
	if (req.body.id) {
		console.log("replace id with: " + req.body.id);
		db.run("UPDATE questions SET id=? WHERE id=?", req.body.id, req.params.n);
	}
	if (req.body.contents) {
		console.log("replace contents with: " + req.body.contents);
		db.run("UPDATE questions SET contents=? WHERE id=?", req.body.contents, req.params.n);
	}
	if (req.body.tokens) {
		console.log("replace tokens with: " + req.body.tokens);
		db.run("UPDATE questions SET tokens=? WHERE id=?", req.body.tokens, req.params.n);
	}
	if (req.body.yes) {
		console.log("replace yes with: " + req.body.yes);
		db.run("UPDATE questions SET yes=? WHERE id=?", req.body.yes, req.params.n);
	}
	if (req.body.no) {
		console.log("replace no with: " + req.body.no);
		db.run("UPDATE questions SET no=? WHERE id=?", req.body.no, req.params.n);
	}
	res.end();
});

//update token
//curl -X PUT http://127.0.0.1:3000/data/tokens/1 -H "Content-Type: application/json" -d '{"id" : 99, "contents" : "fudginess"}'
app.put('/data/tokens/:n', function(req, res) {
	console.log('PUT request for id of token ' + req.params.n + "\n");
	// res.send('PUT request for id of token ' + req.params.n + "\n");
	if (req.body.id) {
		console.log("replace id with: " + req.body.id);
		db.run("UPDATE tokens SET id=? WHERE id=?", req.body.id, req.params.n);
	}
	if (req.body.contents) {
		console.log("replace contents with: " + req.body.contents);
		db.run("UPDATE tokens SET contents=? WHERE id=?", req.body.contents, req.params.n);
	}
	res.end();
});

app.listen(3000, function() {
	console.log("GET - http://localhost:3000/data/questions , http://localhost:3000/data/tokens");
	console.log("POST - http://localhost:3000/data/questions , http://localhost:3000/data/tokens");
	console.log("PUT - http://localhost:3000/data/questions/<idNumber> , http://localhost:3000/data/tokens/<idNumber>");
	console.log("DELETE - http://localhost:3000/data/questions/<idNumber> , http://localhost:3000/data/tokens/<idNumber>");
});