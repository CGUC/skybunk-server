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
