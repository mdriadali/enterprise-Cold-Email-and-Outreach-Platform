import { env } from "@repo/env";
import Express  from "express";  
const app = Express();
const port=env.PORT
app.get('/help',()=>{
  console.log('help');
})
app.listen(port,()=>{
  console.log("port:",port)
})