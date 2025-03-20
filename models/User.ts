import { ObjectId } from 'mongodb'

export interface IUser {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: 'talent' | 'hiring_manager'
  organization?: string
  position?: string
  socialProvider?: string
  createdAt: Date
  updatedAt: Date
}

export class User implements IUser {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: 'talent' | 'hiring_manager'
  organization?: string
  position?: string
  socialProvider?: string
  createdAt: Date
  updatedAt: Date

  constructor(data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>) {
    this.name = data.name
    this.email = data.email
    this.password = data.password
    this.role = data.role
    this.organization = data.organization
    this.position = data.position
    this.socialProvider = data.socialProvider
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  static async create(db: any, userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = new User(userData)
    const result = await db.collection('users').insertOne(user)
    user._id = result.insertedId
    return user
  }

  static async findByEmail(db: any, email: string): Promise<User | null> {
    const userData = await db.collection('users').findOne({ email })
    if (!userData) return null
    const user = new User(userData)
    user._id = userData._id
    user.createdAt = userData.createdAt
    user.updatedAt = userData.updatedAt
    return user
  }

  static async findById(db: any, id: string): Promise<User | null> {
    const userData = await db.collection('users').findOne({ _id: new ObjectId(id) })
    if (!userData) return null
    const user = new User(userData)
    user._id = userData._id
    user.createdAt = userData.createdAt
    user.updatedAt = userData.updatedAt
    return user
  }
} 