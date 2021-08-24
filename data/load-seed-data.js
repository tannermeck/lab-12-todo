const client = require('../lib/client');
const bcrypt = require('bcryptjs');
// import our seed data:
const todos = require('./todos.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    await Promise.all(
      usersData.map(user => {
        const hash = bcrypt.hashSync(user.password, 8);
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, hash]);
      })
    );
      


    await Promise.all(
      todos.map(todo => {
        return client.query(`
                    INSERT INTO todos (todo, completed, user_id)
                    VALUES ($1, $2, $3);
                `,
        [todo.todo, todo.completed, todo.user_id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
