const express = require('express')
const app = express()
const ActiveDirectory = require('activedirectory2');
var ad = new ActiveDirectory({
    url: "example",
    baseDN: "example",
    username: "example",
    password: "example"
  })
const ldapDomain = "it-tf.local"
var sAMAccountName = '';
const jwt = require('jsonwebtoken')

app.use(express.static("../arbeitsjournal/dist"))
app.use('/', require('./middleware/fallback'))
app.use(express.json())

const config = require('./db/knexfile.js')['development'];
var knex = require('knex')(config)

const pepper = "geheimpepper";

const PORT = process.env.port | 83

//LDAP query to find user
const findUser = (username) => {
  return new Promise(resolve => { 
    ad.findUser(username, (err, user) => {
      let status = false
      if(err) {
        resolve({status:status,message:JSON.stringify(err)})
      }
      if(user) {
        status = true
        resolve({status:status,data:user})
      }
      else {
        resolve({status:status,message:"user not found"})
      }
    })
  })
}

//LDAP function to authenticate user
const authUser = (username, password) => {
  return new Promise(resolve => {
    let adUser = `${username}@${ldapDomain}`
    ad.authenticate(adUser, password, (err, auth) => {
      let status = false
      if(err) {
        resolve({status:status,message:JSON.stringify(err)})
      }
      if(auth) {
        status = true
        resolve({status:status,message:"success"})
      }
      else {
        resolve({status:status,message:"wrong password"})
      }
    })
  })
}

//to check if user is member of teachergroup
const isUserMemberOf = (username) => {
  return new Promise(resolve => {
  let groupName = "CN=G_LP_ALL,OU=Group-IT,DC=it-tf,DC=local"
  let adUser = `${username}@${ldapDomain}`

  ad.isUserMemberOf(adUser, groupName, function(err, isMember) {
    let status = false
    if(err) {
      resolve({status:status,message:JSON.stringify(err)})
    }
    if(isMember) {
      status = true
      resolve({status:status,data:isMember})

    }
    else {
      resolve({status:status,message: "User is not Member "})
      }
    })
  })
}
//Send subject for dropdown
app.get('/api/subject', async (req, res) => { 
  let subject = await knex ('subject');
  res.send(subject)
})

//Creates a journal
app.post('/api/create', async (req, res) => {
  let journal = req.body
  let subject = await knex('subject').where('description', journal.subject).first()
  let id = subject.subject_id //Get subject_id for foreign key in table journal

  let result = await knex('journal').insert({
  Date: journal.date,
  Text: journal.text,
  sAMAccountName: journal.sAMAccountName,
  fk_subject: id,
  })
  res.json();
})

//Updates journal
app.put('/api/journal/update', async (req,res) =>{
  let updatedJournal = req.body

  let updatedSubject = await knex('subject')
  .where('description', updatedJournal.subject)
  let id = updatedSubject[0].subject_id //Get subject_id for foreign key in table journal

  let result = await knex('journal')
  .where('journal_id', updatedJournal.journal_id)
  .update({date: updatedJournal.date,
    text: updatedJournal.text,
    fk_subject: id})
    res.json()
})

//deletes journal
app.post('/api/journal/delete', async (req,res) => {
  let deleteId = req.body.toDelete

  //ID is unique. It will delete only one column
  let result = await knex('journal')
  .where('journal_id', deleteId)
  .del()
  res.json()
})

//Sends journal for teacher or student
app.post('/api/journal', async (req, res) => {
  let searchedUser = req.body //If the teacher wants to filter the journal
  let role = searchedUser.role //Who is logged in? Teacher or student

  if (role == 'Teacher') {
    //Filteroptions
    let userSearchVar = searchedUser.sAMAccountName ? searchedUser.sAMAccountName : "%";
    let dateStart = searchedUser.date[0] ? searchedUser.date[0] : '0001-01-01';
    let dateEnd = searchedUser.date[1] ? searchedUser.date[1] : '9999-12-31';
    let subjectSearchVar = searchedUser.subject ? searchedUser.subject : "%";

    let userJournal = await knex('journal')
        .join('subject', 'subject_id', 'fk_subject')
        .where('sAMAccountName', 'like', userSearchVar)
        .whereBetween('date', [dateStart, dateEnd])
        .where('description', 'like', subjectSearchVar)

    //Creates an array for the comments in a journal
    for(let journalId of userJournal){
      let comment = await knex('comment').where('fk_journal', journalId.journal_id)
      journalId.comments = comment
    }
    res.send(userJournal)
  } else { //A student will only get his own journal
      let journal = await knex('journal')
      .join('subject', 'subject_id', 'fk_subject')
      .where('sAMAccountName', searchedUser.username)
      .orderBy([ {column: 'date', order: 'desc'} ])

      //Creates an array for the comments in a journal
      for(let journalId of journal){
        let comment = await knex('comment').where('fk_journal', journalId.journal_id)
        journalId.comments = comment
      }
      res.send(journal)
    }
})

//Creates a comment
app.post('/api/comment', async (req, res) => {
  let comment = req.body
  //Get the date from today and insert into database
  let today = new Date().toISOString().slice(0, 10)

    let result = await knex('comment').insert({
    comment: comment.comment,
    date: today,
    sAMAccountName: comment.sAMAccountName,
    fk_journal: comment.fk_journal
  }) 
  res.json()
})

//Updates a comment
app.put('/api/comment/update', async (req,res) => {
  let updatedComment = req.body
  //When comment is updated, it should refresh the date
  let today = new Date().toISOString().slice(0, 10)

  let result = await knex('comment')
  .where('comment_id', updatedComment.comment_id)
  .update({comment: updatedComment.comment,
    date: today})
    res.json()
})

app.put('/api/username/update', async (req,res) => {
  let newUser = req.body

  if (newUser.role == 'Lehrer') {
    let result = await knex ('comment')
    .where('sAMAccountName', newUser.oldUsername)
    .update({sAMAccountName: newUser.newUsername})
  }

  else if(newUser.role == 'Schüler') {
    let result = await knex('journal')
    .where('sAMAccountName', newUser.oldUsername)
    .update({sAMAccountName: newUser.newUsername})
  }

  res.json()
})

//API for login
app.post('/api/user/login', async (req,res)=> {
    let credentials = req.body
    sAMAccountName = credentials.username
    
    let memberOf = await isUserMemberOf(sAMAccountName) 
    let role = (memberOf.status) ? 'Teacher' : 'Student'

    let userFound = await findUser(sAMAccountName)
    if(userFound.status) {
      // user found
      let authenticated = await authUser(sAMAccountName, credentials.password)
      if(authenticated.status) {
        let payload = {exp: Math.floor(Date.now() / 1000) + (60 * 9999), 
          username:sAMAccountName, role:role}
        let token = jwt.sign(payload, pepper)
        res.json({
          token: token
        })
        // password true 
      }
      else {
        res.json()
        // passwort wrong
      }
    }
    else {
      // user not found
      res.json()
      console.log("error, user not found")
    }

}) 



app.listen(PORT, () => {
	console.clear()
	console.log(`listening on port ${PORT}`)
});
