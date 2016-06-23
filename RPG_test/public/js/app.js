angular.module("RPGApp", ['ngRoute'])
	.config(function($routeProvider) {
		$routeProvider
			.when("/", {
				templateUrl: "list.html",
				controller: "ListController",
				resolve: {
					questions: function(Questions) {
						return Questions.getQuestions();
					},
					tokens: function(Tokens) {
						return Tokens.getTokens();
					}
				}
			})
			.when("/new/question", {
				controller: "NewQuestionController",
				templateUrl: "question-form.html",
				resolve: {
					tokens: function(Tokens) {
						return Tokens.getTokens();
					}
				}
			})
			.when("/question/:questionId", {
				controller: "EditQuestionController",
				templateUrl: "question.html",
				resolve: {
					tokens: function(Tokens) {
						return Tokens.getTokens();
					}
				}
			})
			.when("/new/token", {
				controller: "NewTokenController",
				templateUrl: "token-form.html"
			})
			.when("/token/:tokenId", {
				controller: "EditTokenController",
				templateUrl: "token.html",
			})
			.otherwise({
				redirectTo: "/"
			})
	})
	.service("Questions", function($http) {
		this.getQuestions = function() {
			// console.log($http.get("/data/questions"));
			return $http.get("/data/questions").
				then(function(response) {
					return response;
				}, function(response) {
					alert("Error finding questions.");
				});
		}
		this.createQuestion = function(question) {
			return $http.post("/data/questions", question).
				then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating question.");
                });
		}
		this.getQuestion = function(questionId) {
			var url = "/data/questions/" + questionId;
			return $http.get(url).
				then(function(response) {
					return response;
				}, function(response) {
					alert("Error finding this question.");
				});
		}
		this.editQuestion = function(question) {
			var url = "/data/questions/" + question.id;
			return $http.put(url, question).
				then(function(response) {
					return response;
				}, function(response) {
					alert("Error editing this question.");
					console.log(response);
				});
		}
		this.deleteQuestion = function(questionId) {
			var url = "/data/questions/" + questionId;
			return $http.delete(url).
				then(function(response) {
					return response;
				}, function(response) {
					alert("Error deleting this contact.");
					console.log(response);
				});
		}
	})
	.service("Tokens", function($http) {
		this.getTokens = function() {
			// console.log($http.get("/data/questions"));
			return $http.get("/data/tokens").
				then(function(response) {
					return response;
				}, function(response) {
					alert("Error finding tokens.");
				});
		}
		this.getToken = function(tokenId) {
			var url = "/data/tokens/" + tokenId;
			return $http.get(url).
				then(function(response) {
					return response;
				}, function(response) {
					alert("Error finding this token.");
				});
		}
		this.createToken = function(token) {
			return $http.post("/data/tokens", token).
				then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating token.");
                });
		}
		this.editToken = function(token) {
			var url = "/data/tokens/" + token.id;
			return $http.put(url, token).
				then(function(response) {
					return response;
				}, function(response) {
					alert("Error editing this token.");
					console.log(response);
				});
		}
	})
	.controller("ListController", function(questions, tokens, $scope) {
		$scope.questions = questions.data;
		$scope.tokens = tokens.data;
	})
	.controller("NewQuestionController", function($scope, $location, Questions) {
		$scope.back = function() {
			$location.path("/#");
		}
		$scope.saveQuestion = function(question) {
			Questions.createQuestion(question).then(function(doc) {
				var questionUrl = "/question/" + doc.data.ID;
				$location.path(questionUrl);
			}, function(response) {
				alert(response);
			});
		}
	})
	.controller("EditQuestionController", function($scope, $routeParams, Questions, tokens) {
		Questions.getQuestion($routeParams.questionId).then(function(doc) {
			$scope.question = doc.data;
		}, function(response) {
			alert(response);
		});

		$scope.tokens = tokens.data;

		$scope.toggleEdit = function() {
			$scope.editMode = true;
			$scope.questionFormUrl = "question-form.html";
		}

		$scope.back = function() {
			$scope.editMode = false;
			$scope.questionFormUrl = "";
		}

		$scope.saveQuestion = function(question) {
			Questions.editQuestion(question);
			$scope.editMode = false;
			$scope.questionFormUrl = "";
		}

		$scope.deleteQuestion = function(questionId) {
			Questions.deleteQuestion(questionId);
		}
	})
	.controller("EditTokenController", function($scope, $routeParams, Tokens) {
		Tokens.getToken($routeParams.tokenId).then(function(doc) {
			$scope.token = doc.data;
		}, function(response) {
			alert(response);
		});

		$scope.toggleEdit = function() {
			$scope.editMode = true;
			$scope.tokenFormUrl = "token-form.html";
		}

		$scope.back = function() {
			$scope.editMode = false;
			$scope.tokenFormUrl = "";
		}

		$scope.saveToken = function(token) {
			Tokens.editToken(token);
			$scope.editMode = false;
			$scope.tokenFormUrl = "";
		}

		$scope.deleteToken = function(tokenId) {
			Tokens.deleteToken(tokenId);
		}
	})
	.controller("NewTokenController", function($scope, $location, Tokens) {
		$scope.back = function() {
			$location.path("/#");
		}
		$scope.saveToken = function(token) {
			Tokens.createToken(token).then(function(doc) {
				var tokenUrl = "/token/" + doc.data.ID;
				$location.path(tokenUrl);
			}, function(response) {
				alert(response);
			});
		}
	});