const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const initiallizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(
        'Server Running at https://yogichaitanyapncjfnjscprhnky.drops.nxtwave.tech:3000/',
      )
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initiallizeDBAndServer()

// API 1
app.get('/todos/', async (request, response) => {
  const {status, priority, search_q} = request.query

  const convertDBObjectToResponseObject = dbObject => {
    return {
      id: dbObject.todoId,
      todo: dbObject.todo,
      priority: dbObject.priority,
      status: dbObject.status,
    }
  }

  // scenario 1
  const getTodoQueryS1 = `SELECT * FROM todo WHERE status='${status}';`
  const todoArray1 = await db.all(getTodoQueryS1)
  response.send(
    todoArray1.map(eachQuery => convertDBObjectToResponseObject(eachQuery)),
  )

  // scenario 2
  const getTodoQueryS2 = `SELECT * FROM todo WHERE priority='${priority}';`
  const todoArray2 = await db.all(getTodoQueryS2)
  response.send(
    todoArray2.map(eachQuery => convertDBObjectToResponseObject(eachQuery)),
  )

  // scenario 3
  const getTodoQueryS3 = `SELECT * FROM todo WHERE status='${status}'&priority='${priority}';`
  const todoArray3 = await db.all(getTodoQueryS3)
  response.send(
    todoArray3.map(eachQuery => convertDBObjectToResponseObject(eachQuery)),
  )

  // scenario 4
  const getTodoQueryS4 = `SELECT * FROM todo WHERE search_q='${search_q}';`
  const todoArray4 = await db.all(
    getTodoQueryS4.map(eachQuery => convertDBObjectToResponseObject(eachQuery)),
  )
  response.send(todoArray4)
})

//API 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getSpecificTodoDetails = `SELECT * FROM todo WHERE id='${todoId}';`
  const specificTodo = await db.get(getSpecificTodoDetails)

  const convertDBObjectToResponseObject = dbObject => {
    return {
      id: dbObject.todoId,
      todo: dbObject.todo,
      priority: dbObject.priority,
      status: dbObject.status,
    }
  }
  const result = convertDBObjectToResponseObject(specificTodo)
  response.send(result)
})

// API 3
app.post('/todos/', async (request, response) => {
  const {todoDetails} = request.body
  const {todoId, todo, priority, status} = todoDetails
  const addTodoQuery = `INSERT INTO todo(id,todo,priority,status) VALUES('${todoId}','${todo}','${priority}','${status}');`
  await db.run(addTodoQuery)
  response.send('Todo Successfully Added')
})

// API 4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoDetails = request.body
  const {todo, priority, status} = todoDetails

  // scenario 1
  const updateTodoS1 = `UPDATE todo SET status='${status}' WHERE id=${todoId};`
  await db.run(updateTodoS1)
  response.send('Status Updated')

  // scenario 2
  const updateTodoS2 = `UPDATE todo SET priority='${priority}' WHERE priority='${priority}';`
  await db.run(updateTodoS2)
  response.send('Priority Updated')

  // scenario 3
  const updateTodoS3 = `UPDATE todo SET todo='${todo}' WHERE todo='${todo}';`
  await db.run(updateTodoS3)
  response.send('Todo Updated')
})

// API 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodo = `DELETE FROM todo WHERE id='${todoId}';`
  await db.run(deleteTodo)
  response.send('Todo Deleted')
})

module.exports = app
