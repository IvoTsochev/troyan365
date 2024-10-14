import { supabase } from "./supabase-config";
import uuid from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

type ImageType = ImagePicker.ImagePickerAsset;

// CLOUD URL's
// export const supabaseBaseUrl = "https://qeecuxesbmiidpvycjqq.supabase.co";
// export const supabaseBucketPath = "storage/v1/object/public";
// export const supabaseBucketUrl = `${supabaseBaseUrl}/${supabaseBucketPath}`;

// SELF HOSTED URL's
export const supabaseBaseUrl = "http://139.162.163.228:8000";
export const supabaseBucketPath = "storage/v1/object/public/";
export const supabaseBucketUrl = `${supabaseBaseUrl}/${supabaseBucketPath}/`;

export const GLOBALS = {
  TABLES: {
    USERS: "users",
    LISTINGS: "listings",
    FAVORITES: "favorites",
  },
  BUCKETS: {
    AVATARS: "avatars_bucket",
    LISTINGS: "listings_bucket",
  },
};

// GET IMAGE URL
export const getImageUrl = ({
  bucketName,
  imagePath,
}: {
  bucketName: string;
  imagePath: string;
}) => {
  return `${supabaseBucketUrl}/${bucketName}/${imagePath}`;
};

// UPDATE USER DATA IN USERS TABLE
const insertUserData = async ({
  userId,
  email,
  username,
}: {
  userId: string;
  email: string;
  username: string;
}) => {
  const { data, error } = await supabase.from(GLOBALS.TABLES.USERS).insert([
    {
      user_id: userId,
      email: email,
      username: username,
    },
  ]);

  if (error) {
    throw new Error("Unable to add user data. Please try again.");
  }

  return data;
};

// SIGN UP
export const signUp = async (
  username: string,
  email: string,
  password: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    throw new Error("Sign up failed. Please check your details and try again.");
  }

  const userId = data?.user?.id;

  if (!userId) {
    throw new Error("User ID is undefined");
  }

  const userData = await insertUserData({
    userId: userId,
    email,
    username,
  });

  return {
    error,
    user: data?.user,
  };
};

// SIGN IN
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Invalid credentials. Please try again.");
  }

  return {
    data,
    error,
  };
};

// SIGN OUT
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Error signing out. Please try again.");
  }
};

// GET USER DATA FROM USERS TABLE
export const getUserData = async ({ userId }: { userId: string }) => {
  if (!userId) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from(GLOBALS.TABLES.USERS)
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error("Unable to fetch user data. Please try again later.");
  }

  return data;
};

// GET USER SESSION
export const getUserSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data;
};

// LOAD MORE LISTINGS
export const loadMoreListings = async ({
  currentPage,
}: {
  currentPage: number;
}) => {
  const { data, error } = await supabase
    .from(GLOBALS.TABLES.LISTINGS)
    .select(
      `
      *,
      users (
        email,
        username,
        avatar_url
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(currentPage * 5, (currentPage + 1) * 5 - 1);

  if (error) {
    throw new Error(
      "Error loading more listings. Please refresh and try again."
    );
  }

  return data;
};

// GET USER LISTINGS
export const getUserListings = async (userId: string | undefined) => {
  if (!userId) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from(GLOBALS.TABLES.LISTINGS)
    .select(
      `
      *,
      users (
        email,
        username,
        avatar_url
      )
      `
    )
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load user listings. Please try again later.");
  }

  return data;
};

// COMPRESS IMAGE
const compressImage = async ({
  imageUri,
  compressionLevel = "medium",
}: {
  imageUri: string;
  compressionLevel?: "low" | "medium" | "high";
}) => {
  let maxWidth, maxHeight, compressionRatio;

  switch (compressionLevel) {
    case "low":
      maxWidth = 1600;
      maxHeight = 1600;
      compressionRatio = 0.9;
      break;
    case "medium":
      maxWidth = 1200;
      maxHeight = 1200;
      compressionRatio = 0.7;
      break;
    case "high":
      maxWidth = 800;
      maxHeight = 800;
      compressionRatio = 0.5;
      break;
    default:
      throw new Error("Invalid compression level");
  }

  try {
    const imageInfo = await ImageManipulator.manipulateAsync(imageUri, [], {});

    const originalWidth = imageInfo.width;
    const originalHeight = imageInfo.height;

    const isPortrait = originalHeight > originalWidth;

    const targetWidth = isPortrait ? maxWidth : maxHeight;
    const targetHeight = isPortrait ? maxHeight : maxWidth;

    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: targetWidth } }],
      { compress: compressionRatio, format: ImageManipulator.SaveFormat.JPEG }
    );

    return result.uri;
  } catch (error) {
    throw new Error("Unable to resize image. Please try again.");
  }
};

// CONVERT URI TO Blob
const uriToBlob = async ({ uri }: any) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

// UPLOAD FILES TO SUPABASE STORAGE
export const uploadFile = async ({
  file,
  userId,
  listingId,
}: {
  file: any;
  userId: string;
  listingId: string;
}) => {
  if (!file || !userId || !listingId) {
    throw new Error("Missing file, userId or listingId");
  }

  const compressedImageUri = await compressImage({
    imageUri: file.uri,
    compressionLevel: "medium",
  });
  const fileBlob = await uriToBlob({ uri: compressedImageUri });
  const arrayBuffer = await new Response(fileBlob).arrayBuffer();

  const fileName = file.name || `${new Date().getTime()}_thumbnail.jpg`;
  const pathToUpload = `listings/${userId}/${listingId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(GLOBALS.BUCKETS.LISTINGS)
    .upload(pathToUpload, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw new Error("Error uploading file. Please try again.");
  }

  return data;
};

// DELETE AVATAR
export const deleteAvatar = async ({ userId }: { userId: string }) => {
  if (!userId) {
    throw new Error("Missing userId");
  }

  const getCurrentAvatar = await supabase
    .from(GLOBALS.TABLES.USERS)
    .select("avatar_url")
    .eq("user_id", userId)
    .single();

  if (getCurrentAvatar.error) {
    throw getCurrentAvatar.error;
  }

  const avatarName = getCurrentAvatar.data?.avatar_url?.split("/").pop();

  const path = `${userId}/${avatarName}`;

  const { data, error } = await supabase.storage
    .from(GLOBALS.BUCKETS.AVATARS)
    .remove([path]);

  if (error) {
    console.error("Error deleting avatar from storage:", error);
    throw error;
  }

  const { data: updateUsersData, error: updateUsersError } = await supabase
    .from(GLOBALS.TABLES.USERS)
    .update({ avatar_url: null })
    .eq("user_id", userId);

  if (updateUsersError) {
    console.error("Error updating users table:", updateUsersError);
    throw updateUsersError;
  }

  return { data, updateUsersData };
};

// UPLOAD AVATAR
export const uploadAvatar = async ({
  userId,
  file,
}: {
  userId: string;
  file: any;
}) => {
  if (!file || !userId) {
    throw new Error("Missing file or userId");
  }

  const compressedImageUri = await compressImage({
    imageUri: file.uri,
    compressionLevel: "high",
  });
  const fileBlob = await uriToBlob({ uri: compressedImageUri });
  const arrayBuffer = await new Response(fileBlob).arrayBuffer();

  const fileName = `${new Date().getTime()}_avatar.jpg`;
  const pathToUpload = `${userId}/${fileName}`;

  await deleteAvatar({ userId });

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(GLOBALS.BUCKETS.AVATARS)
    .upload(pathToUpload, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  // Construct the public URL for the avatar
  const avatarUrl = `${
    supabase.storage.from(GLOBALS.BUCKETS.AVATARS).getPublicUrl(pathToUpload)
      .data.publicUrl
  }`;

  // Update the user's avatar URL in the users table
  const { data: updateData, error: updateError } = await supabase
    .from(GLOBALS.TABLES.USERS)
    .update({ avatar_url: avatarUrl })
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  return { uploadData, updateData };
};

// CREATE LISTING
export const createListing = async ({
  form,
  userId,
}: {
  form: {
    title: string;
    thumbnail_image: ImageType | null;
    phone_number1: string;
    description?: string;
  };
  userId: string | undefined;
}) => {
  const listingId = uuid.v4();

  if (!userId) {
    throw new Error("User not found");
  }

  // Upload the thumbnail image if present
  let uploadedThumbnail = null;
  if (form.thumbnail_image) {
    uploadedThumbnail = await uploadFile({
      file: form.thumbnail_image,
      userId,
      listingId: listingId.toString(),
    });
  }

  const { data, error } = await supabase.from(GLOBALS.TABLES.LISTINGS).insert([
    {
      listing_id: listingId.toString(),
      title: form.title,
      phone_number1: form.phone_number1,
      thumbnail_url: uploadedThumbnail?.path || null,
      creator_id: userId,
      description: form.description || null,
    },
  ]);

  if (error) {
    throw new Error(
      "Unable to create listing. Please check your details and try again."
    );
  }

  return data;
};

// LIST FILES IN A BUCKET FOLDER
export const listFiles = async ({
  bucket,
  folderPath,
}: {
  bucket: string;
  folderPath: string;
}) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folderPath, { limit: 5 }); // Adjust the limit based on your folder's file count

  if (error) {
    throw error;
  }

  return data; // Returns an array of files
};

// UPDATE LISTING
export const updateListing = async ({
  listingId,
  form,
  userId,
}: {
  listingId: any;
  form: any;
  userId: string;
}) => {
  if (!userId || !listingId) {
    throw new Error("User not found");
  }

  let newThumbnailUrl = null;

  let updateObj = {
    title: form.title,
    phone_number1: form.phone_number1,
    description: form.description,
    thumbnail_url: "",
  };

  if (form.thumbnail_url.uri) {
    const listFilesInThumbnailFolder = await listFiles({
      bucket: GLOBALS.BUCKETS.LISTINGS,
      folderPath: `listings/${userId}/${listingId}`,
    });
    const path = `listings/${userId}/${listingId}/${listFilesInThumbnailFolder[0].name}`;

    const { data, error } = await supabase.storage
      .from(GLOBALS.BUCKETS.LISTINGS)
      .remove([path]);

    if (error) {
      throw new Error("Error deleting thumbnail from storage");
    }

    newThumbnailUrl = await uploadFile({
      file: form.thumbnail_url,
      userId,
      listingId: listingId.toString(),
    });

    updateObj.thumbnail_url = newThumbnailUrl?.path;
  } else if (typeof form.thumbnail_url === "string") {
    updateObj.thumbnail_url = form.thumbnail_url;
  }

  const { data, error } = await supabase
    .from(GLOBALS.TABLES.LISTINGS)
    .update(updateObj)
    .eq("listing_id", listingId)
    .eq("creator_id", userId);

  if (error) {
    throw new Error("Error updating listing");
  }
};

// UPDATE LISTING ACTIVE STATUS
export const toggleListingActivation = async ({
  listingId,
  isActive,
}: {
  listingId: string;
  isActive: boolean;
}) => {
  if (!listingId) {
    throw new Error("Missing listingId or isActive");
  }

  const { data, error } = await supabase
    .from(GLOBALS.TABLES.LISTINGS)
    .update({ is_active: isActive })
    .eq("listing_id", listingId);

  if (error) {
    throw new Error("Error updating listing status");
  }

  return data;
};

// GET LATEST LISTINGS
export const getLatestListings = async () => {
  const { data, error } = await supabase
    .from(GLOBALS.TABLES.LISTINGS)
    .select(
      `
      *,
      users (
        email,
        username,
        avatar_url
      )
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw new Error("Error fetching latest listings");
  }

  return data;
};

// DELETE LISTING FOLDER FROM SUPABASE STORAGE
export const deleteListingFolder = async ({
  loggedUserId,
  listingId,
}: {
  loggedUserId: string;
  listingId: string;
}) => {
  if (!loggedUserId || !listingId) {
    throw new Error("Missing loggedUserId or listingId");
  }
  const path = `listings/${loggedUserId}/${listingId}`;

  const { data: files, error: listError } = await supabase.storage
    .from(GLOBALS.BUCKETS.LISTINGS)
    .list(path, {
      limit: 15,
    });

  if (listError) {
    throw listError;
  }

  // If files exist, delete them
  if (files?.length > 0) {
    const filePaths = files.map((file) => `${path}/${file.name}`);
    // Delete all files in the folder
    const { error: deleteError } = await supabase.storage
      .from(GLOBALS.BUCKETS.LISTINGS)
      .remove(filePaths);

    if (deleteError) {
      throw new Error("Error deleting files from storage");
    }
  }
};

// DELETE LISTING FROM SUPABASE
export const deleteListing = async ({ listingId }: { listingId: string }) => {
  if (!listingId) {
    throw new Error("Missing listingId");
  }
  const { data, error } = await supabase
    .from(GLOBALS.TABLES.LISTINGS)
    .delete()
    .eq("listing_id", listingId);

  if (error) {
    throw new Error("Unable to delete listing. Please try again later.");
  }

  return data;
};

// ADD TO FAVORITES
export const addFavorite = async ({
  userId,
  listingId,
}: {
  userId: string;
  listingId: string;
}) => {
  const { data, error } = await supabase
    .from(GLOBALS.TABLES.FAVORITES)
    .insert([{ user_id: userId, listing_id: listingId }]);

  if (error) {
    throw new Error("Unable to add to favorites. Please try again.");
  }

  return data;
};

// REMOVE FROM FAVORITES
export const removeFavorite = async ({
  userId,
  listingId,
}: {
  userId: string;
  listingId: string;
}) => {
  const { data, error } = await supabase
    .from(GLOBALS.TABLES.FAVORITES)
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId);

  if (error) {
    throw new Error("Unable to remove from favorites. Please try again.");
  }

  return data;
};

// GET MY FAVORITES
export const getMyFavoriteListingIds = async ({
  userId,
}: {
  userId: string;
}) => {
  const { data, error } = await supabase
    .from(GLOBALS.TABLES.FAVORITES)
    .select(`listing_id`)
    .eq("user_id", userId);

  if (error) {
    console.error("Error getting my favorites:", error);
    throw error;
  }

  return data;
};

// GET SPECIFIC LISTING
export const getSpecificListing = async (listingId: any) => {
  const { data, error } = await supabase
    .from(GLOBALS.TABLES.LISTINGS)
    .select(
      `
      *,
      users (
        email,
        username
      )
    `
    )
    .eq("listing_id", listingId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// SEARCH LISTINGS
type SearchByOptions = "title" | "creator_id" | "phone_number1";
export const searchListings = async ({
  query,
  searchBy = "title",
}: {
  query: string | string[];
  searchBy?: SearchByOptions;
}) => {
  const { data, error } = await supabase
    .from(GLOBALS.TABLES.LISTINGS)
    .select(
      `
      *,
      users (
        email,
        username
      )
    `
    )
    .ilike(searchBy, `%${query}%`);

  if (error) {
    console.error("Error searching listings:", error);
    throw error;
  }

  return data;
};

// REMOVE THUMBNAIL
export const removeThumbnail = async ({
  userId,
  listingId,
}: {
  userId: string;
  listingId: any;
}) => {
  if (!userId || !listingId) {
    throw new Error("Missing userId or listingId");
  }

  const listFilesInThumbnailFolder = await listFiles({
    bucket: GLOBALS.BUCKETS.LISTINGS,
    folderPath: `listings/${userId}/${listingId}`,
  });
  const path = `listings/${userId}/${listingId}/${listFilesInThumbnailFolder[0]?.name}`;

  const { data, error } = await supabase.storage
    .from(GLOBALS.BUCKETS.LISTINGS)
    .remove([path]);

  if (error) {
    throw new Error("Error deleting thumbnail from storage");
  }

  const { data: updateData, error: updateError } = await supabase
    .from(GLOBALS.TABLES.LISTINGS)
    .update({ thumbnail_url: null })
    .eq("listing_id", listingId)
    .eq("creator_id", userId);

  if (updateError) {
    throw new Error("Error removing thumbnail from listing");
  }
};
