import { env } from "@repo/env";
import Express  from "express";  
const app = Express();
const port=env.HTTP_PORT
app.get('/help',()=>{
  console.log(' end point hit help');
})
app.listen(port,()=>{
  console.log("port:",port)
})