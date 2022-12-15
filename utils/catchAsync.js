module.exports=func =>{
    return(req,res,next)=>{//returns func and catches error if not moves to the next
        func(req,res,next).catch(next);
    }
}
//error handler of async functions for whole project