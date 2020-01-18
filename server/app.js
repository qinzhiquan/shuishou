const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const router = require('./router');
const path = require('path');

const app = express();

app.use('/views/',express.static(path.join(__dirname,'./views/')));//开放views目录
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')));

app.use(bodyParser.urlencoded({extended: false}));//post数据解析功能
app.use(bodyParser.json());//post数据解析为json格式

app.use(router);//挂载router

app.listen(8081,()=>{
  console.log('app running at 8081');
});