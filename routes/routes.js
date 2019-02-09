module.exports = function(app){

	app.get('/login', function(req, res){
			res.render('login', {
					title: 'Express Login'
			});
	});

	app.get('/', (req, res) => {
		res.render('index-2');
	});
	
	app.get('/about', (req, res) => {
		res.render('card', {prompt: "Guys"});
	});
	
	app.get('/hello', (req, res) => {
		res.render('hello');
	});
	
	app.post('/hello', (req, res) => {
		res.render('hello', { name: req.body.username });
	});
	
	app.get('/save', function (req, res) {
		fs.writeFile('log.txt', 'This is my text', function (err) {
			if (err) throw err;
			console.log('Replaced!');
			res.send('Replaced!');
		});
	});
	
	app.get('/getprods', function (req, res) {
		getProducts();
	});
	
	app.get('/getljevents', function (req, res) {
		getljevents();
	});
	
	app.get('/swdb800info', function (req, res) {
		getProducts800() ;
	});
};