import PocketBase from 'pocketbase';
import { PB_URL } from '../constant/url';

class PocketBaseService {
  constructor() {
    this.pb = new PocketBase(PB_URL);
    this.initializeAuthListener();
  }

  initializeAuthListener() {
    this.pb.authStore.onChange((auth) => {
      console.log('Auth state changed:', auth);
    });
  }

  // Authentication Methods
  async login(username, password) {
    try {
      return await this.pb.collection('users').authWithPassword(username, password);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    this.pb.authStore.clear();
  }

  // CRUD Operations with Error Handling
  async create(collection, data) {
    try {
      return await this.pb.collection(collection).create(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getList(collection, page = 1, perPage = 50, options = {}) {
    try {
      this.pb.autoCancellation(false);
      return await this.pb.collection(collection).getList(page, perPage, options);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOne(collection, id) {
    try {
      return await this.pb.collection(collection).getOne(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async update(collection, id, data) {
    try {
      return await this.pb.collection(collection).update(id, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(collection, id) {
    try {
      return await this.pb.collection(collection).delete(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error Handler
  handleError(error) {
    console.error('PocketBase Error:', error);
    if (error.status === 400) {
      return new Error(error.data?.message || 'Bad Request');
    }
    return error;
  }

  // Utility Methods
  isAuthenticated() {
    return this.pb.authStore.isValid;
  }

  getCurrentUser() {
    return this.pb.authStore.model;
  }
}

const pbService = new PocketBaseService();
export default pbService;
