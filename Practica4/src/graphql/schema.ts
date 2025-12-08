import { gql } from "apollo-server";

export const typeDefs = gql`
    
     """Respuesta a los intentos de autenticación""" 
    type AuthPayload{
     """ Token JWT correspondiente al usuario autenticado"""
    token: String!
    """ Usuario autenticado"""
    user: User!
    }

    """ Usuario del sistema """
    type User {
        _id: ID!
        username: String!
        email: String!
        password: String
        createdAt: String!
    }
    
    type Project {
        _id: ID!
        name: String!
        description: String
        startDate: String!
        endDate: String!
        owner: User!
        members: [User]!
        tasks: [Task!]!
    }
    
    enum TaskStatus {
        PENDING
        IN_PROGRESS
        COMPLETED
    } 
    enum TaskPriority {
        LOW
        MEDIUM
        HIGH
    }
    
    type Task {
        _id: ID!
        title: String!
        project: Project!
        assignedTo: User
        status: TaskStatus 
        priority: TaskPriority!
        dueDate: String!
    }
    
     input UpdateTaskInput{
        status: TaskStatus
        priority: TaskPriority
    }
    
    input UpdateProjectInput{
        description:String
        endDate: String!
    }
    input RegisterInput {
        username: String!
        email: String!
        password: String!
    }
    
    input LoginInput{
        email: String!
        password: String!
    }
    input CreateProjectInput{
        name: String!
        description: String
        startDate: String!
        endDate: String!,
        members: [ID!]
    }
    
    input TaskInput{
        title: String!
        assignedTo: ID
        status: TaskStatus
        priority: TaskPriority!
        dueDate: String!
    }
    
    type Query {
        myProjects:[Project!]! 
        projectDetails(id: ID!): Project 
        users: [User!]! 
    }
    
    
    
    type Mutation{
    # Públicas
        register(input: RegisterInput!): AuthPayload
        login(input: LoginInput!): AuthPayload
    # Autenticadas
        createProject(input: CreateProjectInput!):Project 
        updateProject(id: ID!, input: UpdateProjectInput!): Project!
        deleteProject(id: ID!):Boolean 
        addMember(projectId: ID!, userId: ID!): Project!
        createTask(projectId: ID!, input: TaskInput!): Task! 
        updateTaskStatus(taskId: ID!, status: TaskStatus!): Task!
    }
        `;
