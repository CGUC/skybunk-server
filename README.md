# GRAPP
_Need a better name..._

![](https://johnanngeister.files.wordpress.com/2011/02/conrad-grebel.jpg)

The mobile application for Conrad Grebel University College students.

## The stack

### Server
- [Node JS](https://nodejs.org/en/) for the backend with the following node modules:
  - [Express JS](https://expressjs.com/) as a web framework
  - [Mongoose](http://mongoosejs.com/) to interact with the database
  - [Body Parser](https://www.npmjs.com/package/body-parser) to parse incoming request bodies
  - Although not manditory, you'll want [nodemon](https://nodemon.io/) to avoid manually restarting the server after every change.
- [MongoDB](https://www.mongodb.com/) for the database
  - MongoDB is not a relational database which is what most people generally think of when they think of databases. MongoDB is a NoSQL database, so it's different than your traditional table-based database. Instead of storing data in tables it's stored in _collections_. You can read more about NoSQL databases [here](https://www.mongodb.com/nosql-explained)

### Client
Currently we're trying out [React-native](https://facebook.github.io/react-native/) to build the mobile application. React Native is a cross-platform framework for mobile development so instead of maintaining two codebases for ios and Android, instead we need only a single codebase written in Javascript and React Native. React Native is very similar to Regular React, but instead of using HTML tags we use tags specific to React Native. React Native also features Hot Reloading which is super cool. If your ios/android device is connected to the same network as your dev machine everytime you change a file the change is automatically reflected on your device so there's no need to wait for compiling or anything to test it.

_**(Aside)** A little bit about React Native:_

_React native gets compiled to native code upon launch, so it essentially becomes a swift app for ios or a java app for android. This preserves the feel of a true native application across devices and performs just as well as if we built the apps in their respective native languages._

## Structure

The application is split into two sections, the server (API) and the client (the app). The client fetches data from the server through the use of HTTP requests. More about the architecture of the each piece can be found in their respective READMEs

## Setting up the dev environment
In order to enable people with very little previous experience to contribute, this section describes how to set up the development environment in fine detail. Luckily, setting up the environment is essentially the same no matter what OS you're using.

### Server
1. Make sure you have [git installed](https://www.linode.com/docs/development/version-control/how-to-install-git-on-linux-mac-and-windows/) (You'll want to become very familiar with git if interested in any sort of real development role)
    - If on windows I suggest using git bash (which should be installed alongside git) instead of a GUI - but ultimately use whatever you find works best for you
2. Clone this repository by running `git clone https://github.com/CGUC/grapp.git` in your terminal
3. Install [Node JS](https://nodejs.org/en/) which also installs NPM (Node package manager)
    - _If you're using linux, I would suggest [installing it through your package manager](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)_
4. Download the [MongoDB community server](https://www.mongodb.com/download-center?jmp=nav#community) for your OS
5. Follow the instructions [here](https://docs.mongodb.com/manual/administration/install-community/) to set up MongoDB
6. In the terminal, navigate to the API folder in this repository
    - eg. `cd /<path to where you ran git clone>/grapp/API`
7. run `npm install` to install the required node_modules
8. install nodemon by running `npm install -g nodemon`

And you're set!

To make sure everythying worked, let's run the server locally. First, make sure your database is running (instructions for this can be found with the installation walkthrough listed above). Then, run `node helpers/populate.js` to load some dummy data into the database. Once that is finished running (if it's taking a while, just kill the process with ctrl-c), run `nodemon` - this will automatically update your server when you edit a file on your computer. With this running, go to http://localhost:3000/examples/Mark in your web browser. If all went well, you should be presented with a JSON similar to the following: 
`{"counter":1,"_id":"5afb90607b209c3008b59ec5","name":"Mark","__v":0}`
If you have issues, make sure you followed the steps above properly and if all else fails feel free to reach out to the dev team.

### Client
1. Do steps 1-3 in the section above
2. In the terminal, navigate to the grapp folder in this repository
    - eg. `cd /<path to where you ran git clone>/grapp/grapp`
3. run `npm install`
4. On your mobile device, download [Expo](https://expo.io/) from the app store for your device.

That's it!
To make sure it works, in your terminal run `npm start`, ensure your device is connected to the same network as your dev machine, then open expo on your device and scan the barcode that's in your terminal. The app should start up on your phone!
