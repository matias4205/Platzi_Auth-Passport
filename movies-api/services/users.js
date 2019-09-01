const Mongo = require('../lib/mongo');
const bcrypt = require('bcrypt');

class UsersService{
    constructor(){
        this.collection = 'users';
        this.mongoDB = new Mongo();
    }

    async getUser({ email }) {
        const [ user ] = await this.mongoDB.getAll(this.collection, { email });
        return user;
    }

    // async getUsers(query){
    //     const query = query && {  };
    //     const [ users ] = await this.mongoDB.getAll(this.collection, )
    //     return users || [];
    // }

    async createUser({ user }){
        const { name, email, password, isAdmin } = user;
        const hashedPasswd = await bcrypt.hash(password, 10);

        const createdUserId = await this.mongoDB.create(this.collection, {
            name,
            email,
            password: hashedPasswd,
            isAdmin
        });

        return createdUserId;
    }

    async getOrCreateUser({ user }){
        const queriedUser = await this.getUser({ email: user.email });
        
        if(queriedUser){
            return queriedUser;
        }

        await this.createUser({ user });
        return await this.getUser({ email: user.email });
    }
}

module.exports = UsersService;