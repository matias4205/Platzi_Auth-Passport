const Mongo = require('../lib/mongo');
const bcrypt = require('bcrypt');

class UsersService{
    constructor(){
        this.collection = 'users';
        this.mongoDB = new Mongo();
    }

    async getUser({ userId }){
        const query = userId && { userId };
        const user = await this.mongoDB.get(this.collection, query);
        return user || {}
    }

    // async getUsers(query){
    //     const query = query && {  };
    //     const [ users ] = await this.mongoDB.getAll(this.collection, )
    //     return users || [];
    // }

    async createUser(user){
        const { name, email, password } = user;
        const hashedPasswd = bcrypt.hash(password, 10);

        const createdUserId = await this.mongoDB.create(this.collection, {
            name,
            email,
            password: hashedPasswd
        });

        return createdUserId;
    }
}

module.exports = UsersService;