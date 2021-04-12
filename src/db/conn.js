const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/registraion', {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('Mongodb is connected Successfully !');
}).catch((e)=>{
    console.log(e)
})