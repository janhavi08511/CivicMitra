<<<<<<< HEAD
import { auth } from "../auth";
=======
import { auth } from "../firebase";
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Special handling for the "client is offline" error which is usually a config issue
  if (errorMessage.includes('the client is offline')) {
<<<<<<< HEAD
    const configError = "The local data backend is unavailable. Please verify the API server and MongoDB connection.";
=======
    const configError = "Firestore connection failed (client is offline). This is likely due to an incorrect Firebase configuration (Project ID, API Key, or Database ID). Please verify your environment variables and firebase-applet-config.json.";
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
    console.error(configError);
    throw new Error(JSON.stringify({
      error: configError,
      originalError: errorMessage,
      operationType,
      path
    }));
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
