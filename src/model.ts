import { Database } from "bun:sqlite";
import { jwt } from '@elysiajs/jwt'
import Elysia from "elysia";
import { cookie } from '@elysiajs/cookie'

const db = new Database("mydb.sqlite");

const app = new Elysia()
.use(
    jwt({
        name: 'jwt',
        secret: process.env.JWT_SWCRET
    })
)
.use(cookie())


const getBooks = () => {
    try {
        const query = db.query(`SELECT * FROM books;`)
        return query.all()
    } catch (error) {
        console.log('error', error);
        return {status: "error", error}
    }
}

const getBook = (id: number) => {
    try {
        const query = db.query("SELECT * FROM books where id=$id;")
        return query.get({
            $id: id
        })
    } catch (error) {
        console.log('error', error);
        return {status: "error", error}
    }
}

const createBook = (book: any) => {
    try {
        if(book.name == null || book.author == null || book.price == null){
            throw new Error("Validation fail")
        }
        const query = db.query(`
            INSERT INTO books 
            ("name", "author", "price") 
            VALUES ($name, $author, $price);`)
        query.run({
            $name: book.name,
            $author: book.author,
            $price: book.price
        })
        return {status: "ok"}
    } catch (error) {
        console.log('error', error);
        return {status: 'error', error}
    }
}

const updateBook = (id: number, book: any) => {
    try {
        const query = db.query(`
            UPDATE books SET "name"=$name, "author"=$author,"price"=$price  
            WHERE "id"=$id`)
        query.run({
            $id: id,
            $name: book.name,
            $author: book.author,
            $price: book.price
        })
    } catch (error) {
        console.log('error', error);
        return {status: "error", error}
    }
}

const deleteBook = (id: number) => {
    try {
        const query = db.query(`DELETE FROM books WHERE id=$id;`)
        query.run({
            $id: id
        })
    } catch (error) {
        console.log('error', error);
        return {status: "error", error}
    }
}

const createUser = (user: any) => {
    try {
        const query = db.query(`
            INSERT INTO users 
            ("email","password") 
            VALUES ($email, $password);`)
        query.run({
            $email: user.email,
            $password: user.password
        })
    } catch (error) {
        console.log('error', error);
        return {status: "error", error}
    }
}

const getUser = async (user: any) => {
    try {
        const query = db.query(`SELECT * FROM users where 
            email=$email;`)
        const userData: any = query.get({
            $email: user.email,
        })
        if(!userData){
            throw new Error("User not found")
        }

        const isMath = await Bun.password.verify(user.password, userData.password)
        if(!isMath){
            throw new Error("User invalid")
        }    
        return{
            loggedIn: true
        }

    } catch (error) {
        console.log('error', error);
        return {
            loggedIn: false
        }
    }
}

export {
    getBooks,
    getBook,
    getUser,
    createBook,
    createUser,
    updateBook,
    deleteBook
}
