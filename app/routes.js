module.exports = function(app, passport, db, multer, ObjectId) {

// Image Upload Code =========================================================================
  var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'public/images/uploads')
      },
      filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + ".png")
      }
  });
  var upload = multer({storage: storage});


// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('homepage.ejs');
    });


    // PROFILE SECTION =========================================================
    //this API retrieves the profile page as long as the right authentication is
    //done correctly
    app.get('/profile', isLoggedIn, function(req, res) {
    // let uId = ObjectId(req.session.passport.user)
    db.collection('codeGhana').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user : req.user,
        messages: result
      })
    })
  });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


// message board routes ===============================================================

    app.post('/profile', (req, res) => {
      db.collection('questions').save({name: req.body.name, question: req.body.question, answers: []}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })
    app.post('/answer', (req, res) => {
      console.log("POSTEEDDDD");
      db.collection('answers').save({answer: req.body.answer,questionId: req.body.num}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })


    app.put('/profile', (req, res) => {
      db.collection('codeGhana')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/profile', (req, res) => {
      db.collection('codeGhana')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp - 1,
        }
      }, {
    //code below ensures that
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/answer', (req, res) => {
      console.log(req.body);
        db.collection('questions').findOneAndUpdate({question: req.body.question}, {
          $push: {
            answers:req.body.answer,
          }
        })
      })

    app.delete('/profile', (req, res) => {
      db.collection('codeGhana').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

    // mentors questions board routes ===============================================================

      app.get('/dashboard', isLoggedIn, function(req, res) {
        db.collection('questions').find().toArray((err, result) => {
            if (err) return console.log(err);
            console.log(result);
            res.render('dashboard.ejs', {
              user : req.user,
              questions: result
            })
          })
    });

    // mentors individual questions board routes ===============================================================
    app.get('/questions', isLoggedIn, function(req, res) {
      db.collection('questions').find().toArray((err, result) => {
        db.collection('answers').find({questionId: req.query.question}).toArray((err, answer) => {
            res.render('question.ejs', {
              question: result[req.query.question],
              num: req.query.question,
              answers: answer
            })
          })
        })
  });

    // mentors answers board routes ===============================================================

      app.get('/answers', isLoggedIn, function(req, res) {
        console.log('testing');
        db.collection('answers').find().toArray((err, result) => {
            if (err) return console.log(err);
            console.log(result);
            res.render('answers.ejs', {
              user : req.user,
              answers: result
            })
          })
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        //show the mentors login form
        app.get('/mentors', function(req, res) {
            res.render('mentors.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
