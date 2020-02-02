define({ "api": [
  {
    "type": "post",
    "url": "/users",
    "title": "Create User",
    "description": "<p>Create user with valid golden ticket from db.</p>",
    "name": "CreateUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>User object to create</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Mandatory user object fields + example:",
          "content": "{\n  username: \"connieG\",\n  password: \"t@uferman123\",\n  firstName: \"Conrad\",\n  lastName: \"Grebel\",\n  goldenTicket: \"valid_ticket_from_db\"\n}",
          "type": "json"
        }
      ]
    },
    "permission": [
      {
        "name": "none"
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "delete",
    "url": "/users/:id",
    "title": "Delete",
    "name": "DeleteUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Target user's ID</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid auth token from user login</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "admin",
        "title": "Requesting user must belong to admin usergroup",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/users/loggedInUser",
    "title": "Get logged-in User",
    "description": "<p>Return user data matching auth token provided in header.</p>",
    "name": "GetLoggedInUser",
    "group": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid auth token from user login</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "user",
        "title": "Client must be authenticated as a registered user",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/users/:id/notificationToken",
    "title": "Get Notification Token",
    "name": "GetNotificationToken",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Target user's ID</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid auth token from user login</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "user",
        "title": "Client must be authenticated as a registered user",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/users/:id/profilePicture",
    "title": "Get Profile Picture",
    "name": "GetProfilePicture",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Target user's ID</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid auth token from user login</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "user",
        "title": "Client must be authenticated as a registered user",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/users/:id/subscribedChannels/posts",
    "title": "Get Subscribed Posts",
    "description": "<p>Get posts (paginated) from channels subscribed to by requesting user</p>",
    "name": "GetSubscribedPosts",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Requesting user's ID</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "Number",
            "optional": false,
            "field": "page",
            "description": "<p>Pagination index</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "none"
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/users/:id",
    "title": "Get User by ID",
    "name": "GetUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Target user's ID</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid auth token from user login</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "user",
        "title": "Client must be authenticated as a registered user",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/users",
    "title": "Return all Users",
    "name": "GetUsers",
    "group": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid auth token from user login</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "user",
        "title": "Client must be authenticated as a registered user",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/users/:id/markNotifsSeen",
    "title": "Mark Notifications Seen",
    "description": "<p>Mark all notifications as 'seen' for a user</p>",
    "name": "MarkNotificationsSeen",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Requesting user's ID</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid auth token from user login</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "self",
        "title": "Client must be authenticated as user it is trying to modify",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/users/reset/:username/:token",
    "title": "Reset Password with Token",
    "description": "<p>Complete password reset process with token obtained from email link.</p>",
    "name": "ResetPasswordWithToken",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Target user's username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Token obtained from password reset email</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>User object with new <code>password</code></p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/users/reset",
    "title": "Send Password Reset Email",
    "description": "<p>Start the password reset process by sending the target user an email.</p>",
    "name": "SendPasswordResetEmail",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>Target user data including <code>username</code> or <code>firstName</code> &amp; <code>lastName</code></p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "none"
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/users/:id/password",
    "title": "Update Password",
    "description": "<p>Callable only by user themself.</p>",
    "name": "UpdatePassword",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Requesting user's ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>Updated user data including <code>password</code> field</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid auth token from user login</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "self",
        "title": "Client must be authenticated as user it is trying to modify",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "put",
    "url": "/users/:id/profilePicture",
    "title": "Update Profile Picture",
    "name": "UpdateProfilePicture",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Requesting user's ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "file",
            "description": "<p>Picture file with <code>buffer</code> field</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid auth token from user login</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "self",
        "title": "Client must be authenticated as user it is trying to modify",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "put",
    "url": "/user/:id",
    "title": "Update",
    "description": "<p>Callable by admin or user themself.</p>",
    "name": "UpdateUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Target user's ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>Updated user data</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid auth token from user login</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "admin",
        "title": "Requesting user must belong to admin usergroup",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/users/login",
    "title": "Login",
    "description": "<p>Attempts user authentication given username and password, returning Auth token if successful.</p>",
    "name": "UserLogin",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "body",
            "description": "<p>Must include <code>username</code> and <code>password</code> fields.</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "none"
      }
    ],
    "version": "0.0.0",
    "filename": "controllers/userController.js",
    "groupTitle": "User"
  }
] });
