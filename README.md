# Skybunk Server [![CircleCI](https://circleci.com/gh/CGUC/skybunk-server.svg?style=svg)](https://circleci.com/gh/CGUC/skybunk-server)

The server to process requests from the Skybunk mobile applicaiton.

### How it works

This provides a [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer) for our application. It serves as a mediator between our database and the mobile application. The application makes HTTP requests to the server, which in turn responds to the application with the appropriate data in the form of JSON. This is relatively standard for communication across most web systems.

#### What is REST?
REST (Representational State Transfer) is simply an architectural style to communicate via HTTP requests. If you're interested in learning about HTTP (Which you should be) you can read more about it [here](https://www.tutorialspoint.com/http/index.htm)

In order to contribute, all you _really_ need to know is four of the HTTP methods:
- POST - Used for creating data
- PUT - Used for updating data
- GET - Used for retrieving data
- DELETE - Used for deleting data

These requests are handled by our controllers. For example, A `GET` request at `/examples/<Name>` in our API is handled in `controllers/exampleController.js` via `router.get('/:name', ...)` and returns the example document with the name matching `<Name>`
## The stack

- [Node JS](https://nodejs.org/en/) for the backend
  - [Express JS](https://expressjs.com/) as a web framework
  - [Mongoose](http://mongoosejs.com/) to interact with the database
- [MongoDB](https://www.mongodb.com/) for the database
  - MongoDB is not a relational database which is what most people generally think of when they think of databases. MongoDB is a NoSQL database, so it's different than your traditional table-based database. Instead of storing data in tables it's stored in _collections_. You can read more about NoSQL databases [here](https://www.mongodb.com/nosql-explained)

## Setting up the dev environment
In order to enable people with very little previous experience to contribute, this section describes how to set up the development environment in fine detail. Luckily, setting up the environment is essentially the same no matter what OS you're using.

1. Make sure you have [git installed](https://www.linode.com/docs/development/version-control/how-to-install-git-on-linux-mac-and-windows/) (You'll want to become very familiar with git if interested in any sort of real development role)
    - If on windows we suggest using git bash (which should be installed alongside git) instead of a GUI - but ultimately use whatever you find works best for you
2. Fork the repo in Github so you have your own local copy
3. Clone your forked repository by running `git clone https://github.com/YourGithubUsername/skybunk-server` in your terminal
3. Install [Node JS](https://nodejs.org/en/) which also installs NPM (Node package manager)
    - _If you're using linux, we suggest [installing it through your package manager](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)_
4. Follow the instructions [here](https://docs.mongodb.com/manual/administration/install-community/) to download, set up, and run MongoDB for your operating system
5. `cd` into this repository
6. run `npm install` to install the required node modules
7. If you want to have some data to test on, you can run `node helpers/scripts/copy_prod_data.js`. This copies all users, posts, and channels from the production database, and sets all user passwords to 'password'. This does not have the ability to copy pictures to the development repo (though this can be added if someone wants to!).

And you're set!

To make sure everythying worked, let's run the server locally. First, make sure your database is running (instructions for this can be found with the installation walkthrough listed above). Then, run `npm start` - this will start your server and automatically update your server when you edit a file on your computer. With this running, go to http://localhost:3000/users in your web browser. If all went well, you should be presented with a JSON with the user data in the database.

If you have issues, make sure you followed the steps above properly and if all else fails feel free to reach out to the dev team.

## Populating and modifying your local database for testing
Please refer to the [helper scripts documentation](./helpers/scripts/help.md)

## Connecting Development Server to Development Web and Mobile
If you are working on a feature that requires both the server and front-end to be changed, you will need to connect your server to your mobile and web development environment. The steps to do such are as follows:

1. Start the server using the above instructions. Verify that it is properly working on port 3000
2. Install ngrok using `npm install -g ngrok`
3. Run `ngrok http 3000`. This will forward port 3000 to a URL, which will be printed out when you run the command. Copy the URL that is given.
4. In the web and mobile clients, modify API_ADDRESS in config.js to the URL that is output from ngrok. This tells your apps to look at your development server instead of looking at the production server.
5. Make sure to not include the config.js change in your commits, since that URL should remain the same for the app to work in production.

## Architecture
We're following traditional [MVC](https://www.tutorialspoint.com/mvc_framework/mvc_framework_introduction.htm) format throughout our application. This means controllers take care of the requests coming in from the views, and translate the input to the models. Therefore, all business logic should be done through the use of methods on the models and the controllers simply serve as a mediator between incoming HTTP requests and actions on the models. Thew View in this case is the app itself.

We'll place all controllers in the `controllers` folder, and all model definitions in the `models` folder. Example models and controllers exist so you can see how they are implemented.

## Server administration
There are a few administrative tools that are useful to make sure the production server is running and verifying or editting production data.

These tools are behind password protection, so talk to one of the current admins to discuss if you need access to these tools. If you do have access to these tools, use them responsibly or your permissions will be revoked.

### MLab [https://mlab.com](https://mlab.com)
Mlab is a cloud-hosted MongoDB server where all of production skybunk data is stored . It is useful to view data that is not publically accessible such as object IDs or subscribed channels. It can also be used to mutate the data, such as deleting a user. 

**It is important that you never share this data publicly, since it contains private information like password hashes and noticiation tokens, which can be used maliciously.**

With that disclaimer out of the way, on to a few more details of what to do in MLabs.


#### Instances
There are multiple databases instances, and they will likely change over time. Below is a summary of their uses.

* grapp: Contains the main production data for Grebel, including user, posts, pictures, etc.
* skybunk-staging: Used to test code changes before their final push to production.
* skybunk-dev: Used as a sandbox where developers can do whatever they need to implement a new feature
* skybunk-auth: The auth database stores user login information and associates an account to a server (in Grebel's case, the user will be directed to grapp). There is a prod, dev, and staging versions of this server as well.

#### Editting a Document
To edit a document such as a post or user, follow the following instructions.

1. Navigate to the desired instance.
2. Find the collection where the document of interest is located.
3. Find the document, either by scrolling through the pages or by creating a search using MongoDB syntax.
4. A JSON edittor will appear. You can edit whatever text needed in the JSON document, then save using the buttons in the bottom right corner.

#### Backing up the Server
To backup the server:

1. login to MLabs and navigate to the instance you want to backup
2. Click on the "Tools" tab.
3. Copy the "Export Database" command.
4. Open a terminal on your local machine and paste the command. Replace the username and password with your MLab credentials, and replace the <output directory> with the filepath to the folder you want to save the information. If you want to use your current directory to dump the data, you can use "." as the output directory.
  
The command should look similar to this:

` mongodump -h <server address> -d <database instance> -u <MLabs username> -p <password> -o <output directory> `

` mongodump -h ds123456.mlab.com:12345 -d grapp -u conrad_grebel -p my_strong_password -o . `

#### Reseting Posts
At the beginning of each term, the posts from the previous term are deleted to give incoming students a clean slate to start the term with. This is managed though MLabs.

1. Backup the server
2. Navigate to "Collections"
3. Navigate to "Posts" collection.
4. Double check you actually backed everything up
5. Click on "Delete all documents in collection"
6. Repeat steps 3-5 for PostPictures, Polls, and Media.

### Heroku [https://dashboard.heroku.com](https://dashboard.heroku.com)
Heroku is the server that the server code runs on. The Heroku server recieves the HTTP requests from the clients, processes them, and then updates or reads MLabs based on the request. The Heroku server also hosts the website and auth server.

* grebel-app: this is the main production server, hosted at [api.grebelife.com](http://api.grebelife.com/).
* skybunk-staging: this server is used to stage releases before going to production. Is it located at [https://skybunk-staging.herokuapp.com/](https://skybunk-staging.herokuapp.com/)
* skybunk-development: this is linked to the master branch on Github, meaning that whatever is on master will be deployed to this server. It is located at [https://skybunk-development.herokuapp.com/](https://skybunk-development.herokuapp.com/)

#### Restarting the Server
Our code is great, but it isn't perfect. Sometimes the server crashes and doesn't recover. When this happens, you can following the following steps.

1. Login to Heroku and click on the instance that is crashed (e.g. skybunk-server).
2. Click on the name of the pipeline that has crashed (e.g. grebel-app).
3. In the top right corner, click on "More", then select "Restart all dynos"
4. Confirm that you want to restart the dynos when the warning dialog pops up.

#### Getting logs
Nothing ever breaks in production. But how do we debug when something breaks in production? We can pull the logs from Heroku, which records the last 2000 lines of console output and HTTP transactions. To access this, you first need to setup the Heroku CLI. The instructions for installation can be found [here](https://devcenter.heroku.com/articles/heroku-cli).

Once the CLI is install, [you will need to login](https://devcenter.heroku.com/articles/authentication) to the CLI using your Heroku credentials. You can then run the following command to get the logs.

`heroku logs -a grebel-app -n 2000`

To see a live stream of the logs, use the -t option:

`heroku logs -a grebel-app -t`


