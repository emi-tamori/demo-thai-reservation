const Data = require('../models/Data');

module.exports = {
    getData: (req,res) => {
        Data.findData()
            .then(data=>{
                console.log('data in controller:',data);
                res.status(200).json(data);
            })
            .catch(e=>console.log(e));
    },

    putUser: (req,res) => {
        const id = parseInt(req.params.id);
        const {name,cuttime,shampootime,colortime,spatime} = req.body;

        try{
            Data.updateUser({id,name,cuttime,shampootime,colortime,spatime})
                .then(message=>{
                    console.log('message:',message);
                    res.status(200).send(message);
                })
                .catch(e=>console.log(e));
        }catch(error){
            res.status(400).json({message:error.message});
        }
    },

    getStaffs: (req,res) => {
        Data.getStaffs()
            .then(data=>{
                res.status(200).json(data);
            })
            .catch(e=>console.log(e));
    },

    staffRegistration: (req,res) => {
        const {name} = req.body;
        console.log('name in req.body',name);
        try{
            Data.staffRegister({name})
                .then(message=>{
                    console.log('message=',message);
                    res.status(200).send(message);
                })
                .catch(e=>console.log(e));
        }catch(error){
            res.status(400).json({message:error.message});
        }
    },

    shiftsRegistration: (req,res) => {
        const data = JSON.parse(req.body);
        console.log('data in controller',data);
    }
}