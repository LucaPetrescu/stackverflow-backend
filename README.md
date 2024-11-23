# Design Stackoverflow

**Note:** This is a theoretical design that focuses on a large scale distributed approach of designing an application like Stackoverflow.

In the developed code, most of the components are not present since it is a code written for demonstrative purposes and adding all the elements and services in this design will be very time consuming, overwhelming and will not lead to anywhere.

This approach reflects my way of thinking when faced with a system design problem.

However, explanaitions about how I wrote the code and the approaches I've taken are provided in this document.

References are provided at the end of the document.

## Functional requirements

1. Users should be able to create an account and login
2. Users should be able to create posts
3. Users should be able to answer questions
4. Users should be able to upvote or downvote questions
5. Users should be able to see the top k ranking posts when opening the app
6. Users should be able to see details of selected questions
7. Users should not be able to post or answer questions if they are not authenticated
8. Users should be able to see real time updates

## Non-functional requirements

1. The application should scale up to 10m+ DAU (Daily Active Users)
2. Handle high volume of posts
3. Highly available

## High-Level Design

**Note:** If the picture is not loading, I have included it in the project root directory. See design_stackoverflow.jpg

![alt text](https://github.com/LucaPetrescu/stackverflow-backend/blob/main/design_stackoverflow.png)

## Entities

1. Post
2. Comment
3. User

## API Design

### Auth Service

```
POST /auth/register {
	username
	email
	password
	first_name
	last_name
} -> {
	Created 201
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

### Top K Posts Service

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

### Reply Service

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

### Post Service

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

```
POST /post/downvote/{postId} {
	Authorization: Bearer <access_token>
} -> {
	Success 200

} | {
	Unauthorized 401
}
```

```
GET /post/getAllPosts {
	Authrotization: Bearer <access_token>
} -> {
	Success 200
} | {
	Unauthorized 401
}
```

#### 1. Users should be able to create an account and log in

The approach here is pretty straightforward. In the high-level design, the user is routed via the API Gateway to the User Service, which also handles the authentication and authorization logic. Here, the user creates an account or logs in. From here, he or she will be able to access the other routes and services of the application.
To make sure the user is authenticated, an approach with JWT was used in the code.

Another requirement was to always redirect the user to the page where all of the questisons are. 

This is done in the code in the authentication service: once the user logs in, all of the posts will be fetched. Of course, you can make this look nicer by building a frontend.

For implementing the API Gateway in my code, I have used NGINX. Also, features like rate limiting for preventing system overwhelming were provided. More on that later.

#### 2. Users should be able to create posts

The user post creation is handled by the Post Service. Here, the user can create, upvote, downvote, see all the posts and get a certain post. As mentioned earlier, and also provided in the Functional Rquirements, the user cannot interact with this service unless it is authenticated.

For handling high reads without querying the Database everytime the user requests a certain post, I have implemented a caching solution with Redis. In the Redis Cache, posts will be stored with a TTL, so later if the user will request to see the same post (maybe he checks a post from 5 to 5 minutes to see the latest comments), the database will not need to be queried.

#### 3. Users should be able to reply to a post (answer questions)

This is handled by the Reply Service. Everytime the user wants to answer a question, the Post Service will take care of that. It will also write the response to the DB. Also, a Post entry will keep an array of replies IDs to keep track of the replies from that specific post.

#### 4. Users should be able to upvote or downvote posts

This is handled by the Post Service in the `/upvote` and `/downvote` endpoints. Also, these endpoints will not be available unless the user is authenticated.

#### 5. Users should be able to see top k ranking posts

There are multiple ways of building a Top K Posts Service. It can be considered as a totally separate system design problem, but we will tackle it anyways.

I my approach, I have used Mongo aggregation pipelines. it allowed me to make a combined query that aggregates results based on some conditions. For example, I am requesting the top 10 posts with the most upvotes and the most number of comments. I am also making use of ```$merge``` that merges the output into the top_posts collection, updating existing posts or inserting new ones if they don’t exist. This way, we do not have to always create a new ```top_posts``` collection.

To make sure we retrieve the data as fast as possible, a Redis Cache was added to cahce the results. The cache is constanlty updated at a certain interval of time.

To query the database at a certain interval of time, we can use a cron job that runs at a certain time interval (10 minutes would be okay).

#### 6. Users should be able to see details of selected questions

Here, the user can see a certain question. It ca see the details of that question: The question itself, replies, upvotes/downvotes etc.

#### 7. Users should not be able to post or answer questions if they are not authenticated

This is the authentication/authorization logic we have been talking about in the begining. Basically, users will not be able to interact with certain endpoints unless they are authenticated. This is done by the user logging in and recieving an access token. This is done by leveraging JWT. 

On the endpoints that interact with the posts and comments, users will need to have the access token in the Authorization Header in order to be able to make certain operations. The token is checked by an authorization middleware which is included in every of the services that interacts with the posts. The middleware gets the token from the header and checks it. If the token is valid, than the user can post, comment, upvote or downvote questions.

#### 8. Users should be able to see real time updates

This is done by using a combination between queueying solutions and real-time communication (WebSockets, SSE etc)

When a user posts a new question or answers a question, the update will be pushed to a queue (most probably RabbitMQ). Here, the events will be consumed by a service that is always on the watch for new events created in the queue. The service will get the events form the queue and establish a WebScocket connection with the client to send the updates. This can also be done with Server Sent Events.

## Deep Dives

#### How can we scale up from 10m DAU to 30m DAU?

In 2022, Stackoverflow reached 100m DAU per month. This is quite a huge number. In this scenario, scalability is really important. 

There are plenty of ways to scale the an application, depending on the needs it has to fulfil. One way of do it use leveraging horizontal scaling. This means that multiple instances of that services can be addded in order to fulfil the high demand.

We can also make use of load balancers. NGINX comes with a solution for this. We can pick algorithms like Round Robin or Least Connections in order to evenly distribute the load. Implement load balancing for all horizontally scaled services and databases.

#### How can we handle high throughput?

In an app like Stackoverflow there will always be a high number of requests for creating new posts or replying to posts. In order to handle this problem, we can make use of queying services like Kafka or RabbitMQ.

If we need to think about fault tolerance (let's say that the Post Service or Database goes down), a good approach will be to use a system like Kafka, since posts are persisted inside the topics.

Another way to think about high throughput, would be the use of a Rate Limiter. This makes sure that the services are not overwhelmed by requests.

In my approach, I have used NGINX for implementing an API Gateway and also Rate Limiting.

#### How can we handle updates without shutting down the whole system?

One of the most commonly used technique in updating software as it runs is using the Rolling Updates technique. What this means, is that whenever an update is released for a software application, new versions of an application or service are deployed incrementally across instances or nodes, replacing older versions one at a time. This ensures there is no downtime and that some instances of the old version remain active while the new version is rolled out.

Using docker to run multiple containers will be very helpful in this approach, since in fact, rolling updates align well with the core principles of microservice architectures.

In out application, we have more microservices that run accros a network. Let's say we want to deploy a new update for the version for the authentication service. Say we have 3 instances of thi service running. Firstly, we will stop the first instance from serving any traffic. We will update this instance, test it to see if it runs correcnt and if it is able to recieve any traffic, and after that integrate it back to the pool of services that serve traffic. The same process will hapen for the next running insances of the service.

## References

1. Evan King, Stefan Mai @ Hellointerview.com
2. Alex Xu, System Design Interview Volume 1 & Volume 2
