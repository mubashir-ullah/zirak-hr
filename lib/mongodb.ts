/**
 * @deprecated This file is maintained for backward compatibility only.
 * All new code should use the Supabase client directly.
 * This file will be removed in a future update.
 */

import supabase from './supabase';

// This is a compatibility layer to help with the migration from MongoDB to Supabase
// It provides a mock interface that resembles the MongoDB API but uses Supabase under the hood

export async function connectToDatabase() {
  console.warn('Warning: Using deprecated MongoDB compatibility layer. Please update to use Supabase directly.');
  
  // Return a mock db object that provides basic MongoDB-like functionality
  // but actually uses Supabase
  return {
    db: {
      collection: (collectionName: string) => ({
        find: async (query: any = {}) => {
          console.warn(`Deprecated: Using MongoDB compatibility layer for collection "${collectionName}"`);
          const { data, error } = await supabase.from(collectionName).select('*');
          if (error) throw error;
          return {
            toArray: async () => data || []
          };
        },
        findOne: async (query: any = {}) => {
          console.warn(`Deprecated: Using MongoDB compatibility layer for collection "${collectionName}"`);
          // Convert MongoDB query to Supabase query
          // This is a simplified version and may not work for all queries
          const { data, error } = await supabase.from(collectionName).select('*').limit(1);
          if (error) throw error;
          return data?.[0] || null;
        },
        insertOne: async (doc: any) => {
          console.warn(`Deprecated: Using MongoDB compatibility layer for collection "${collectionName}"`);
          const { data, error } = await supabase.from(collectionName).insert([doc]).select();
          if (error) throw error;
          return { 
            insertedId: data?.[0]?.id,
            acknowledged: true
          };
        },
        updateOne: async (filter: any, update: any) => {
          console.warn(`Deprecated: Using MongoDB compatibility layer for collection "${collectionName}"`);
          // This is a simplified version and may not work for all updates
          const { data, error } = await supabase
            .from(collectionName)
            .update(update.$set || update)
            .eq('id', filter.id || filter._id)
            .select();
          if (error) throw error;
          return {
            modifiedCount: data?.length || 0,
            acknowledged: true
          };
        },
        deleteOne: async (filter: any) => {
          console.warn(`Deprecated: Using MongoDB compatibility layer for collection "${collectionName}"`);
          const { error } = await supabase
            .from(collectionName)
            .delete()
            .eq('id', filter.id || filter._id);
          if (error) throw error;
          return {
            deletedCount: 1,
            acknowledged: true
          };
        },
        aggregate: (pipeline: any[]) => {
          console.warn(`Deprecated: Using MongoDB compatibility layer for collection "${collectionName}" with aggregation`);
          // This is a very simplified mock and won't work for most aggregations
          return {
            toArray: async () => {
              const { data, error } = await supabase.from(collectionName).select('*');
              if (error) throw error;
              return data || [];
            }
          };
        }
      })
    },
    client: {
      close: async () => {
        // No need to close Supabase connection
        return true;
      }
    }
  };
}

// Export a default client promise for compatibility
const clientPromise = Promise.resolve({
  db: () => ({
    collection: (collectionName: string) => ({
      // Same methods as above, but simplified
      find: async () => ({ toArray: async () => [] }),
      findOne: async () => null,
      insertOne: async () => ({ insertedId: null, acknowledged: true }),
      updateOne: async () => ({ modifiedCount: 0, acknowledged: true }),
      deleteOne: async () => ({ deletedCount: 0, acknowledged: true })
    })
  }),
  connect: async () => ({}),
  close: async () => ({})
});

export default clientPromise;
