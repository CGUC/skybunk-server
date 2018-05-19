# The GRAPP Server

This is a [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer) for our application. It serves as a mediator between our database and the mobile application. The application makes HTTP requests to the server, which in turn responds to the application with the appropriate data in the form of JSON. This is relatively standard for communication across most web systems.

## What is REST?
REST (Representational State Transfer) is simply an architectural style to communicate via HTTP requests. If you're interested in learning about HTTP (Which you should be) you can read more about it [here](https://www.tutorialspoint.com/http/index.htm)

In order to contribute, all you _really_ need to know is four of the HTTP methods:
- POST - Used for creating data
- PUT - Used for updating data
- GET - Used for retrieving data
- DELETE - Used for deleting data

These requests are handled by our controllers. For example, A `GET` request at `/examples/<Name>` in our API is handled in `controllers/exampleController.js` via `router.get('/:name', ...)` and returns the example document with the name matching `<Name>`

## Structure
We're following traditional [MVC](https://www.tutorialspoint.com/mvc_framework/mvc_framework_introduction.htm) format throughout our application. This means controllers take care of the requests coming in from the views, and translate the input to the models. Therefore, all business logic should be done through the use of methods on the models and the controllers simply serve as a mediator between incoming HTTP requests and actions on the models. 

We'll place all controllers in the `controllers` folder, and all model definitions in the `models` folder. Example models and controllers exist so you can see how they are implemented.