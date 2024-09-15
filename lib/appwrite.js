import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.headless.troyan365",
  projectId: "66e32ec6000d9568bfec",
  databaseId: "66e3c4aa003bbcdeace9",
  userCollectionId: "66e3c4ce001b43edd5e9",
  listingsCollectionId: "66e3e1b7001dd7c97eb2",
  storageId: "66e51f7b00049b9401ff",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  listingsCollectionId,
  storageId,
} = config;

// Init your React Native SDK
const client = new Client();

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// CREATE USER
export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw new Error("Failed to create user");

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

// SIGN IN
export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

// Get Account
export const getAccount = async () => {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
};

// GET CURRENT USER
export const getCurrentUser = async () => {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

// GET ALL POSTS
export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      listingsCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    console.error(error);
  }
};

// GET LATEST POSTS
export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      listingsCollectionId,
      [Query.orderDesc("$createdAt", Query.limit(7))]
    );

    return posts.documents;
  } catch (error) {
    console.error(error);
  }
};

// SEARCH POSTS
export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      listingsCollectionId,
      [Query.search("title", query)]
    );

    return posts.documents;
  } catch (error) {
    console.error(error);
  }
};

// GET USER POSTS
export const getUserPosts = async (userId) => {
  if (!userId) return;
  try {
    const posts = await databases.listDocuments(
      databaseId,
      listingsCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    console.error(error);
  }
};

// SIGN OUT
export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.error(error);
  }
};

// GET FILE PREVIEW
export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw new Error("Failed to get file preview");

    return fileUrl;
  } catch (error) {
    console.error(error);
  }
};

// UPLOAD FILE
export const uploadFile = async (file, type, userId, listingId) => {
  if (!file) return;

  const fileName = `${userId}/${listingId}/${file.fileName}`;

  const asset = {
    name: fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };

  try {

    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset,
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    console.error(error);
  }
};

// CREATE LISTING
export const createListing = async (form) => {
  if (!form.userId) return;
  
  try {
    const listingId = ID.unique();

    const [thumbnailUrl, videoUrl] = await Promise.all([
      form.thumbnail_url
        ? uploadFile(form.thumbnail_url, "image", form.userId, listingId)
        : Promise.resolve(""),
      form.video ? uploadFile(form.video, "video", form.userId, listingId) : Promise.resolve(""),
    ]);


    const newPost = await databases.createDocument(
      databaseId,
      listingsCollectionId,
      listingId,
      {
        title: form.title,
        thumbnail_url: thumbnailUrl || null,
        // video: videoUrl || null,
        phone_number1: Number(form.phone_number1),
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    console.error("Error in createListing:", error);
    throw error;
  }
};

// DELETE LISTING FILES
export const deleteListingFiles = async (userId, listingId) => {
  try {
    // List all files in storage (for simplicity, assuming that the file names follow the structure)
    const files = await storage.listFiles(storageId);

    // Filter files that belong to the specific listing (using naming convention)
    const listingFiles = files.files.filter(file => file.name.startsWith(`${userId}/${listingId}/`));

    // Loop through and delete each file
    for (const file of listingFiles) {
      await storage.deleteFile(storageId, file.$id);
    }

    console.log(`Deleted all files for listing: ${listingId}`);
  } catch (error) {
    console.error("Error deleting listing files:", error);
    throw error;
  }
};



// DELETE LISTING AND ASSOCIATED FILES
export const deleteListing = async (listingId) => {
  try {
    // Retrieve the listing document to get the file IDs
    const listing = await databases.getDocument(databaseId, listingsCollectionId, listingId);

    // Loop through and delete all associated images
    const imageFiles = listing.images || []; // Assuming images are stored as an array
    for (let image of imageFiles) {
      if (image.fileId) {
        await storage.deleteFile(storageId, image.fileId);  // Delete each file by fileId
      }
    }

    // Finally, delete the listing itself
    const deletedPost = await databases.deleteDocument(
      databaseId,
      listingsCollectionId,
      listingId
    );

    console.log(`Deleted listing and associated files for listingId: ${listingId}`);
    return deletedPost;
  } catch (error) {
    console.error("Error in deleteListing:", error);
    throw error;
  }
};
