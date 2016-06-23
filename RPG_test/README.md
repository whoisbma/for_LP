Web client running online at [https://rpg-server-lp.herokuapp.com/](https://rpg-server-lp.herokuapp.com/) (provided it isn't asleep)

It uses node/express/body-parser/sqlite3.

Access the JSON served by the API at 

- [/data/questions](https://rpg-server-lp.herokuapp.com/data/questions)
- [/data/tokens](https://rpg-server-lp.herokuapp.com/data/tokens)
- [/data/questions/--questionID--](https://rpg-server-lp.herokuapp.com/data/questions/0)
- [/data/tokens/--tokenID--](https://rpg-server-lp.herokuapp.com/data/tokens/0)

There are minor errors that pop up in the client and it is basically boilerplate bootstrap and basic Angular but the pipeline works, API requests work as they are intended to, etc.

Needs an npm install, xcode project etc. if downloaded.

For the OF client side app, extremely quick and dirty: just uses a few vectors of structs to store state grabbed from JSON.

Video documentation here: 
[https://www.youtube.com/watch?v=ROW0qfDISVs&feature=youtu.be](https://www.youtube.com/watch?v=ROW0qfDISVs&feature=youtu.be)