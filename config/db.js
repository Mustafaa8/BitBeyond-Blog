const mongoose = require('mongoose')
const dbConnection = async ()=>{
    try{
        mongoose.set('strictQuery',false)
        const conn = await mongoose.connect(process.env.CONN_URL)
        console.log(`Database Connected : ${conn.connection.host}`)
    } catch(err){
        console.error(err);
    }
}

module.exports = dbConnection;