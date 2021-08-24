require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signin')
        .send({
          email: 'tanner@gmail.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 20000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns authorized user list within user_id', async() => {

      const expectation = [
        {
          id: 1,
          todo: 'vacuum the livingroom',
          completed: true,
          user_id: 2
        },
        {
          id: 2,
          todo: 'clean the garage',
          completed: false,
          user_id: 2
        },
        {
          id: 3,
          todo: 'wash the dog',
          completed: false,
          user_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('post todo to authorized user list', async() => {
      const newTodo = {
        todo: 'Eat lunch',
        completed: true,
        user_id: 2
      };
      const expectation = {
        id: 4,
        todo: 'Eat lunch',
        completed: true,
        user_id: 2
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(data.body).toEqual(expectation);
    });
    test('update todo based on :id', async() => {
      const expectation = {
        id: 1,
        todo: 'Vacuum the livingroom',
        completed: false,
        user_id: 2
      };
      const data = await fakeRequest(app)
        .put('/api/todos/1')
        .send(expectation)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
