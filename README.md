# Kaksha API

- **Kaksha is a digital classroom platform with LIVE updates when a user enters or leave the classroom**
- **The project is hosted at [http://kaksha.ramkrishnan.live](http://kaksha.ramkrishnan.live)**
- **It also maintains logs and generates report on the fly**
- **Kaksha is developed using the MERN stack - MongoDB, Express, React, Node.js and Socket.io**
- **This document covers the API part of the application**

---

## Pre-requisites

To run the project locally, you need to have the following: 

- Node  - [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- MongoDB - [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

## Get the project

- **Clone the project**

    `git clone https://github.com/ramkrishnan6/kaksha-api.git`

- **Change directory**

    `cd kaksha-api`

## Install necessary packages

`npm install`

## Initial Configuration

- Create an `env` file from the given template

    `cp .env.example .env`

- Copy your database URL (from MongoDB Atlas or local setup) in `DB_URL`
- Enter a long, random string in`TOKEN_SECRET` which will be used for creating JWT (JSON Web Token)

## Run the application (development server)

- `npm start`

---

## Endpoints

- User Register - `POST /user/register`
- User Login - `POST /user/login`
- User Dashboard - `GET /user/dashboard`
- Start class - `POST /class` (Create)
- Class detail - `GET /class/<id>` (Read)
- Update class - `PUT /class/<id>` (Update)
- Report of all classes - `GET /class`(List)

---

## Middlewares

- `verifyToken` - verifies that the user's token is valid and adds the request user's id to request object

---

## Models

### User

- User Model stores the information about the user
    - First name
    - Last name
    - Email ID
    - Hashed password
    - Role (teacher or student)
    - Created at

### Class

- Class Model stores the information about a class
    - Class name
    - Is active
    - Started at
    - Ended at
    - Logs - one to many relationship with ClassLog model

### ClassLog

- ClassLog Model stores the logs related to all the classes
    - Class name
    - Time
    - Type of log (in or out)
    - User - has reference to _id in the User Model

    ---

## Socket.io

### Listeners:

- `connection` - when a client establishes the socket connection
- `join-room` - when the user has joined the classroom
- `disconnect` - when a client disconnects the socket

### Events:

- `user-connected` - when a user connects
- `user-disconnected` - when a user disconnects
- `leave-room` - ask a user to leave the room

---

## Detailed Request and Response

### 1. User Register

Request

```jsx
POST /user/register HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
    "first_name": "Ram",
    "last_name": "Krishnan",
    "email": "ramkrishnan@live.com",
    "password": "password",
    "role": "student" // or teacher 
}
```

Response 

```jsx
{
    "data": {
        "id": "random-id",
	 "first_name": "Ram",
	 "last_name": "Krishnan",
	 "email": "ramkrishnan@live.com",
         "role": "student"
    }
}
```

### 2. User Login

Request

```jsx
POST /user/login HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
    "email": "ramkrishnan@live.com",
    "password": "password"
}
```

Response

```jsx
{
    "token": "some random token"
}
```

### 3. User Dashboard

Request

```jsx
GET /user/dashboard HTTP/1.1
Host: 127.0.0.1:8000

auth-token: <enter_your_auth_token> // as recieved from Login API
```

Response

```jsx
{
    "data": {
        "message": "This is your dashboard",
        "first_name": "Ram",
        "last_name": "Krishnan",
        "email": "ramkrishnan@live.com",
        "role": "student"
    }
}
```

### 4. Start Class

Request

```jsx
POST /class HTTP/1.1
Host: 127.0.0.1:8000

auth-token: <enter_your_auth_token> // as recieved from Login API
Content-Type: application/json

{
    "number": "Physics",
    "is_active": true
}
```

Response - Status 200

### 5. Specific Class Details

Request

```jsx
GET /class/Physics HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json
auth-token: <enter_your_auth_token> // as recieved from Login API
```

Response

```jsx
{
    "data": {
        "is_active": false,
        "ended_at": "2020-11-04T07:21:27.869Z",
        "_id": "5fa2554a8900e2fc9fb124c8",
        "number": "Physics",
        "__v": 0,
        "started_at": "2020-11-04T07:20:38.838Z"
        "logs": [
            {
                "type": "in",
                "_id": "5fa2554a78a5a0de648389fb",
                "class_number": "Physics",
                "time": "2020-11-04T07:16:26.348Z",
                "user": {
                    "role": "teacher",
                    "_id": "5f9c71cb9e1edb639ea0b178",
                    "first_name": "Your",
                    "last_name": "Teacher",
                    "email": "teacher@live.com",
                    "password": "$2a$10$5.J3yskwRFEaTRYzlek/VO8cEKT02owE3bFhmFWWaemfvkyNwiLEu",
                    "created_at": "2020-10-30T20:04:27.707Z",
                    "__v": 0
                },
                "__v": 0
            },
            
           
        ],
    }
}
```

### 6. Update Class

Request

```jsx
PUT /class/Physics HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json
auth-token: <enter_your_auth_token> // as recieved from Login API

{
    "is_active": false
}

```

Response - Status 200

### 7. Report of all classes

Report

```jsx
GET /class HTTP/1.1
Host: 127.0.0.1:8000
```

Request

```jsx
{
    "data": [
        {
            "is_active": false,
            "ended_at": "2020-11-03T20:56:34.124Z",
            "_id": "5fa1c23f8900e2fc9f8ee86a",
            "number": "chem",
            "__v": 0,
            "started_at": "2020-11-03T20:49:03.274Z"

            "logs": [
                {
                    "type": "in",
                    "_id": "5fa1c23f07727673961bfcdf",
                    "class_number": "chem",
                    "time": "2020-11-03T20:49:03.414Z",
                    "user": {
                        "role": "teacher",
                        "_id": "5f9c71cb9e1edb639ea0b178",
                        "first_name": "Aayushi",
                        "last_name": "Somani",
                        "email": "aayushi@live.com",
                        "password": "$2a$10$5.J3yskwRFEaTRYzlek/VO8cEKT02owE3bFhmFWWaemfvkyNwiLEu",
                        "created_at": "2020-10-30T20:04:27.707Z",
                        "__v": 0
                    },
                    "__v": 0
                },
                
            ],

        },                      
    ]
}
```