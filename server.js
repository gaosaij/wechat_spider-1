'use strict';
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const app = express();
const config = require('./config');
const Category = require('./models/Category');

const data = require('./api/data');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/wechat-data-api', data);

app.use('/wechat-data', express.static(path.join(__dirname, './client/build')));
app.get('/wechat-data/*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

// 接口设置抓取此分类内的账号
app.post('/spider', async (req, res, next) => {
  let args = req.body;
  let categoryId = args.categoryId;
  if (!categoryId) return next();
  let category = await Category.findOne({ _id: categoryId });
  if (!category) return next();
  let msgBizs = category.msgBizs;
  res.end('ok');
  if (!msgBizs.length) return;
  config.insertJsToNextProfile.targetBiz = msgBizs;
  config.insertJsToNextPage.targetBiz = msgBizs;
});

const server = http.createServer(app);

const io = require('socket.io')(server);

exports = module.exports = server;
exports.io = io;