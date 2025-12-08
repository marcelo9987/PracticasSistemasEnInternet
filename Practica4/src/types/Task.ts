import {ObjectId} from "mongodb";

export enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED"
}

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}

export type Task = {
    _id?: ObjectId
    title: String
    project: ObjectId
    assignedTo?: ObjectId
    status: TaskStatus
    priority: TaskPriority
    dueDate: Date
}