import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'

const users = [
    {
        id: '1',
        name: 'Hasib',
        email: 'hasib@example.com',
        age: 60
    },
    {
        id: '2',
        name: 'Demo',
        email: 'demo@example.com',
        age: 60
    },
    {
        id: '3',
        name: 'Demo 2',
        email: 'demo2@example.com',
        age: 60
    },
    {
        id: '4',
        name: 'Demo 3',
        email: 'demo3@example.com',
        age: 60
    }
]

const posts = [
    {
        id: '1',
        title: 'What is Lorem Ipsum?',
        body: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
        published: true,
        author: '1'
    },
    {
        id: '2',
        title: 'Why do we use it?',
        body: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
        published: true,
        author: '2'
    },
    {
        id: '3',
        title: 'Where does it come from?',
        body: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.',
        published: false,
        author: '2',
    },
]

const comments = [
    {
        id: '1',
        text: 'What is Lorem Ipsum?',
        author: 1,
        post: 1
        
    },
    {
        id: '2',
        text: 'Why do we use it?',
        author: 2,
        post: 1
        
    },
    {
        id: '3',
        text: 'Where does it come from?',
        author: 3,
        post: 1
        
    },
    {
        id: '4',
        text: '4th comment ',
        author: 1,
        post: 2
        
    }
]

const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String) : [Post!]!
        me: User!
        post: Post!
        comments: [Comment!]!
    }

    type Mutation {
        createUser(data: createUserInput): User!
        createPost(data: createPostInput): Post!
        createComment(data: createCommentInput): Comment!
    }

    input createUserInput {
        name: String!
        email: String!
        age: Int
    }

    input createPostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }

    input createCommentInput {
        text: String!
        author: ID!
        post: ID!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment]!
    }
    
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`
const resolvers = {
    Query: {
        users(parent, args, ctx, info) {
            if (!args.query) {
                return users
            }

            return users.filter((user) => {
                return user.name.toLocaleLowerCase().includes(args.query.toLocaleLowerCase())
            })
        },
        me() {
            return {
                id: 'abc123',
                name: 'M H Hasib',
                email: 'hasib@hasib.com',
                age: null
            }
        },
        posts(parent, args, ctx, info) {
            if (!args.query) {
                return posts
            }
        
            return posts.filter((post) => {
                return post.title.toLocaleLowerCase().includes(args.query.toLocaleLowerCase())
            })
        },        
        post() {
            return {
                id: 'adcd123',
                title: 'This is a Post',
                body: 'This is body',
                published: true
            }
        },
        comments (parent, args, ctx, info) {
            return comments
        }
    },
    Mutation: {
        createUser (parent, args, ctx, info) {
            const emailTaken = users.some((user) => user.email === args.data.email)

            if (emailTaken) {
                throw new Error('Email taken.')
            }

            const user = {
                id: uuidv4(),
                ...args.data
            }

            users.push(user)

            return user
        },
        createPost (parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.data.author)
            if (!userExists) {
                throw new Error('User not found.')
            }

            const post = {
                id: uuidv4(),
                ...args.data
            }

            posts.push(post)

            return post
        },
        createComment (parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.data.author)
            if (!userExists) {
                throw new Error('User not found.')
            }
            
            const postExists = posts.some((post) => post.id === args.data.post)
            if (!postExists) {
                throw new Error('Post not found.')
            }

            const comment = {
                id: uuidv4(),
                ...args.data
            }

            comments.push(comment)

            return comment
        }
    },
    Post: {
        author (parent, args, ctx, info) {
            return users.find((user) => {
                return user.id == parent.author
            })
        },
        comments (parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author == parent.id
            })
        }
    },
    User: {
        posts (parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author == parent.id
            })
        },
        comments (parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author == parent.id
            })
        }
    },
    Comment: {
        author (parent, args, ctx, info) {
            return users.find((user) => {
                return user.id == parent.author
            })
        },
        post (parent, args, ctx, info) {
            return posts.find((post) => {
                return post.id == parent.post
            })
        }
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(() => {
    console.log('Server Starts!')
})
