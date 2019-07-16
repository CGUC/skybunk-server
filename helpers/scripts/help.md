# HELPER SCRIPTS

This document will outline all of the available scripts and how to use them.

## Summary

We have the following scripts which perform the described action

| Name 		  	  		| Action 																													  |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------|
| generateGoldenTickets | Create 150 golden tickets on a server for user registration  																  |
| create_channel  		| Create a channel on a server																								  |
| change_password 		| Safely change the password of a user on a server																			  |
| manage_admins   		| Add or remove admins from a server 																						  |
| copy_prod_data  		| Copy the data from production to your local database so you have some functioning test data. Must have a registered account |
| populate		  		| No current use 																											  |
| /migrations/	  		| the scripts in this folder were used to migrate old data after schema changes 											  |

You can also use http clients such as postman or insomnia to hit relevant endpoints in order to register, login, make a post, etc.
You can check the controllers folder for relevant endpoints.
An endpoint in `userController` can be accessed using http://localhost:3000/users/... etc.

See the API documentation for more details (_these docs do not yet exist_)

## Usage

### generateGoldenTickets

`node generateGoldenTickets.js`

This script will create 150 golden tickets in your local database and print them to the console.
You can use these tokens to register users by hitting the `users/register` login with the relevant parameters in the request body.

### create_channel

`node create_channel.js`

You can then specify the channel name and description.

To create a channel in your local database, when it asks for `user` input `dev`, and you can leave the password blank.
To create a channel in production, you must be a registered database user for the production server. 

### change_password

`node create_channel.js`

First specify the username of the user whos password you'd like to change.
Then input the new password.
Then confirm the new password.

To create a channel in your local database, when it asks for user input `dev`, and you can leave the password blank.
To create a channel in production, you must be a registered database user for the production server. 

### manage_admins

`node manage_admins.js`

You can then add admins (a) remove admins (r) or view all admins (v)
If adding or removing admin privileges you will then have to specify the user's username
To manage admins in production you will need the mlab url for your desired database.

### copy_prod_data

`node copy_prod_data.js`

You will then need to log in to your production Skybunk account. This will then copy the data from the production
server associated with your account to your local database.
