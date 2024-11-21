
### Functional requirements

1. Users should be to create an account and login
2. Users should be able to create posts
3. Users should be able to answer questions
4. Users should be able to upvote or downvote questions
5. Users should be able to see the top k ranking posts when opening the app
6. Users should be able to see details of selected questions
7. Users should not be able to post or answer questions if they are not authenticated
8. Users should be able to see real time updates

### Non-functional requirements

1. The application should scale up to 10m+ DAU (Daily Active Users)
2. Handle high volume of posts
3. Highly available

### High-Level Design

![[stack_overflow(1).png]]

### Entities

1. Post
2. Comment
3. User

### API Design

#### Auth Service

```
POST /auth/register {
	username
	email
	password 
	first_name
	last_name
} -> {
	Created 200
	auth_token
	}
```

```
POST /auth/login {
	email,
	password
} -> {
	Success 200
	auth_token
} | {
	Not Found 404
	}
```

```
GET /auth/profile {
	Authorization: Bearer <access_token>
} -> {
		Success 200
		user_profile(username, name, email etc)
	}
```

#### User Service

```
GET /user/posts {
	Authorization: Bearer <access_token>
} -> {
	Success 200
	Post[]: list
} | {
	Unauthorized 401
	}
```

#### Top K Posts Service

```
GET /topPosts {
	Authorization: Bearer <access_token>
} -> {
	Success 200
	Post[]: list (list of top posts)
} | {
	Unauthorized 401
}
```

#### Reply Service

```
POST /reply/createReply/{questionId} {
	Authorization: Bearer <access_token>
	Reply
} -> {
	Created 201
	Reply
} | {
	Unauthorized 401
} | {
	Not Found 404
}
```

```
POST /reply/upvote/{questionId} {
	Authorization:  Bearer <access_token>
}
```

#### Post Service

```
POST /post/createPost {
	Authorization: Bearer <access_token>
	Post
} -> {
	Created 201
	Post
} | {
	Unauthorized 401
}
```

```
GET /post/getPost/{postId} {
	Authorization: Bearer <access_token>
} -> {
	Success 200
	Post
} | {
	Unauthorized 401
} | {
	Not Found 404
}
```

```
POST /post/upvote/{postId} {
	Authorization: Bearer <access_token>
} -> {
	Success 200
		
} | {
	Unauthorized 401
}
```