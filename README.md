# Blog API

## Run Locally

**My environment versions:**

- Node: V20

- MongoDB: V6

**Commands to run**

Download the project or run
```bash
  git clone https://github.com/Amer-Zakaria/blog-api.git
  cd ./blog-api 
```

Install dependencies
```bash
  npm i
```

**Set up the environment variables:**

create and place an `.env` file in the root directory

example:
```bash
  DB_URI="mongodb://127.0.0.1:27017/blog"
  PORT=3000
  JWT_PRIVATE_KEY=password
```

**Start the server 🚀**
```bash
  npm start
```

Note: inside the log messages you'd find the nescessary links, e.g. Swagger Docs
Note: to get the admin privileges (deleting blogs), you should modify the `isAdmin` field for the user manually in the DB (don't forget to signin again to reflect the change)  
