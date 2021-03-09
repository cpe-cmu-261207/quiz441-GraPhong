import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import fs from 'fs'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, query, validationResult } from 'express-validator'

const app = express()
app.use(bodyParser.json())
app.use(cors())

const PORT = process.env.PORT || 3000
const SECRET = "SIMPLE_SECRET"

interface DbSchema {
  users: User[]
}

interface User {
  id: number
  username: string
  password: string
  firstname:string
  lastname:string
  balance: number
}



type JWTPayload = Pick<User, 'id' | 'username'>

const readDbFile = (): DbSchema => {
  const raw = fs.readFileSync('db.json', 'utf8')
  const db: DbSchema = JSON.parse(raw)
  return db
}



type LoginArgs = Pick<User, 'username' | 'password'>

app.post<any, any, LoginArgs>('/login',
  (req, res) => {

    const { username, password } = req.body
    // Use username and password to create token.
    const db = readDbFile()
    const user = db.users.find(user => user.username === req.body.username)
    if (!user) {
      res.status(400)
      res.json({ message: 'Invalid username or password' })
      return
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      res.status(400)
      res.json({ message: 'Invalid username or password' })
      return
    }
    const token = jwt.sign(
      { id: user.id, username: user.username } as JWTPayload, 
      SECRET
    )
    res.json({ token })
  })

type RegisterArgs = Omit<User, 'id'>

app.post<any, any, RegisterArgs>('/register',
body('username').isString(),
body('password').isString(),
  (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(400)
      res.json(errors)
      return
    }
    if(body('username').isString(), == req.body.username){
      res.status(400)
      res.json({ message: 'Username is already in used'})
      return
    }

    const { username, password, firstname, lastname, balance } = req.body
    const db = readDbFile()
    const hashPassword = bcrypt.hashSync(password, 10)
    db.users.push({
      id: Date.now(),
      username,
      password: hashPassword,
      firstname,
      lastname,
      balance,
    })
  
    fs.writeFileSync('db.json', JSON.stringify(db))
    res.json({ message: 'Register successfully' })
  })


app.get('/balance',
  (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
  
    }
    catch (e) {
      //response in case of invalid token
    }
  })

app.post('/deposit',
  body('amount').isInt({ min: 1 }),
  (req, res) => {

    //Is amount <= 0 ?
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ message: "Invalid data" })
  })

app.post('/withdraw',
  (req, res) => {
  })

app.delete('/reset', (req, res) => {

  //code your database reset here
  
  return res.status(200).json({
    message: 'Reset database successfully'
  })
})

app.get('/me', (req, res) => {
  
})

app.get('/demo', (req, res) => {
  return res.status(200).json({
    message: 'This message is returned from demo route.'
  })
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))