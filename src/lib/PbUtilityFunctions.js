import pb from "./pocketbase";

/**
 * Create a new record in a given collection.
 */
export async function createRecord(collection, data) {
  try {
    const record = await pb.collection(collection).create(data);
    return { success: true, data: record };
  } catch (error) {
    console.error(`Error creating record in ${collection}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieve all records from a collection.
 */
export async function getRecords(collection, options = {}) {
  try {
    pb.autoCancellation(false);
    const records = await pb.collection(collection).getList(1, 100, options); // Adjust pagination as needed
    return { success: true, data: records.items };
  } catch (error) {
    console.error(`Error fetching records from ${collection}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieve a single record by ID.
 */
export async function getRecordById(collection, id) {
  try {
    const record = await pb.collection(collection).getOne(id);
    return { success: true, data: record };
  } catch (error) {
    console.error(`Error fetching record ${id} from ${collection}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a record.
 */
export async function updateRecord(collection, id, data) {
  try {
    const updatedRecord = await pb.collection(collection).update(id, data);
    return { success: true, data: updatedRecord };
  } catch (error) {
    console.error(`Error updating record ${id} in ${collection}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a record.
 */
export async function deleteRecord(collection, id) {
  try {
    await pb.collection(collection).delete(id);
    return { success: true, message: `Record ${id} deleted successfully.` };
  } catch (error) {
    console.error(`Error deleting record ${id} from ${collection}:`, error);
    return { success: false, error: error.message };
  }
}
