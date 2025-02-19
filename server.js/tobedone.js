//storing data in mdb via terminal
curl http://localhost:5000/api/fetch
//if successful
{ "message": "CSV Data Stored in MongoDB" }
//to verify
mongo
use (database)
db.sensordatas.find().pretty()


//to retrieve stored data from mdb in fe
curl http://localhost:5000/api/data
//will return everthing in json

//connecting with fe to api
fetch('http://localhost:5000/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

//to update data 
curl http://localhost:5000/api/fetch

//flow of the project
//csv to to parse csv to mdb to api to fe.





