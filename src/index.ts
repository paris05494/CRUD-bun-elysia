import { Elysia, t, error } from "elysia";
import { createBook, getBooks, getUser, getBook, updateBook, deleteBook, createUser } from "./model"
import { password } from "bun";

const app = new Elysia()


// Book API
app.get('/books', () => getBooks())
app.get('/books/:id', async ({ jwt, set, cookie: { token }, params }) => {
  const profile = await jwt.verify(token)

  return getBook(parseInt(params.id))
})

app.post('/books', ({ body,set }) => {
  const bookBody: any = body
  const response = createBook({
    name: bookBody.name,
    author: bookBody.author,
    price: bookBody.price
  })
  if(response.status === 'error'){
    set.status = 400
    return{messsage: "insert incomplete"}
  }
  return {messsage: 'ok'}
}, {
  body: t.Object({
    name: t.String(),
    author: t.String(),
    price: t.Number()
}),
  headers: t.Object({
    mike: t.String()
  })
} )

app.put('/books/:id', ({ params,body,set }) => {
  try{
  const bookBody: any = body
  const bookId: number = parseInt(params.id)
  const response:any = updateBook(bookId, {
    name: bookBody.name,
    author: bookBody.author,
    price: bookBody.price
  })
  if (response.status === 'error'){
    set.status = 400
    return{messsage: "insert incomplete"}
  }
  return {messsage: 'ok'}
  } catch (error) {
    set.status = 500
    return{messsage: "error something wrong"}
  }
} )

app.delete('/books/:id', ({ params,body,set }) => {
  try {
    const bookId: number = parseInt(params.id)
    const bookBody: any = body
    deleteBook(bookId)
    return {
      messsage: `Delete id ${bookId}`
    }
    
  } catch (error) {
    set.status = 500
    return{messsage: "error something wrong"}
  }
})



// User API
app.post('/register', async({ body,set }) => {
  try {
    let userData: any = body
    userData.password = await Bun.password.hash(userData.password, {
    algorithm: "bcrypt",
    cost: 4,
  });
  createUser(userData)
  return {
    message: "Create user successful!"
  }
  } catch (error) {
    set.status = 500
    return {
      message: "error",
      error
    }
  }
}, {
  body: t.Object({
    email: t.String(),
    password: t.String()
  })
})

app.post('/login', async({ jwt, cookie, setCookie, body, set }) => {
  try {
    let userData: any = body
    const response = await getUser(userData)
    if(!response.loggedIn){
      set.status = 403
      return {
        message: "Login fail"
      }
    }

    setCookie('token', await jwt.sign({
      email: userData.email
    }), {
      httpOnly: true,
      maxAge: 7 * 86400,
    })

    return {
      message: "Login successful!",
      auth: cookie.auth
    }
  } catch (error) {
    
  }
}, {
  body: t.Object({
    email: t.String(),
    password: t.String()
  })
})


app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
