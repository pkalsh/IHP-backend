/**
 * app.js
 *
 * @date 2020-11-22
 * @author pkalsh
 */


var express = require('express')
  , http = require('http')
  , path = require('path');

var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');

var expressSession = require('express-session');
  
var flash = require('connect-flash');

var config = require('./config/config');
var database = require('./database/database');
var route_loader = require('./routes/route_loader');

const cors = require('cors');
var app = express();

app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');


console.log('config.server_port : %d', config.server_port);
app.set('port', process.env.PORT || 3000);
 

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));
 
app.use(cookieParser());

app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

app.use(cors());

var router = express.Router();
route_loader.init(app, router);

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


//===== 서버 시작 =====//

process.on('uncaughtException', function (err) {
	console.log(err.stack);
});

process.on('SIGTERM', function () {
    app.close();
});

app.on('close', function () {
	if (database.db) {
		database.db.close();
	}
});
 
var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

	database.init(app, config);
});
