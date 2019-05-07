import { InternalServerErrorException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

export class Preconditions {
  private static _instance: Preconditions = new Preconditions();
  constructor() {
    if (Preconditions._instance) {
      throw new Error('Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.');
    }
    Preconditions._instance = this;
  }

  public static getInstance(): Preconditions {
    return Preconditions._instance;
  }

  checkValidId(objectId) {
    // Throw exception if calling to update without id
    if (!objectId || !ObjectId.isValid(objectId)) {
      throw new InternalServerErrorException();
    }
  }
}
