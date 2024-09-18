import { supabase } from "./supabase-config";
import uuid from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";

type ImageType = ImagePicker.ImagePickerAsset;

export const supabaseBaseUrl = "https://qeecuxesbmiidpvycjqq.supabase.co";
export const supabaseBucketPath = "storage/v1/object/public";
export const supabaseBucketUrl = `${supabaseBaseUrl}/${supabaseBucketPath}`;

// e.g. https://qeecuxesbmiidpvycjqq.supabase.co/storage/v1/object/public/listings_bucket/listings/d314fbce-d056-46e4-a55d-82f19d2ca940/c4655a5c-d611-4b5d-b924-d9e90e77902a/IMG_0005.jpg
// listings => main folder in bucket
// d314fbce-d056-46e4-a55d-82f19d2ca940 => user id folder
// c4655a5c-d611-4b5d-b924-d9e90e77902a => listing id folder
// IMG_0005.jpg => image file

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
  const { data, error } = await supabase.from("users").insert([
    {
      user_id: userId,
      email: email,
      username: username,
    },
  ]);

  if (error) {
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
  }
};

// GET USER SESSION
export const getUserSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data;
};

// GET USER LISTINGS
export const getUserListings = async (userId: string | undefined) => {
  if (!userId) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      users (
        email,
        username
      )
      `
    )
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Function to convert the URI to a Blob
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

  const fileBlob = await uriToBlob({ uri: file.uri });
  const arrayBuffer = await new Response(fileBlob).arrayBuffer();

  const fileName = file.name || `${new Date().getTime()}_thumbnail.jpg`;
  const pathToUpload = `listings/${userId}/${listingId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("listings_bucket")
    .upload(pathToUpload, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return data;
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

  const { data, error } = await supabase.from("listings").insert([
    {
      listing_id: listingId.toString(),
      title: form.title,
      phone_number1: form.phone_number1,
      thumbnail_url: uploadedThumbnail?.path || null, // Save the uploaded file path
      creator_id: userId,
    },
  ]);

  if (error) {
    throw error;
  }

  return data;
};

// GET LATEST LISTINGS
export const getLatestListings = async () => {
  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      users (
        email,
        username
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw error;
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

  // List all files in the listing folder
  const { data: files, error: listError } = await supabase.storage
    .from("listings_bucket")
    .list(path, {
      limit: 15, // Adjust this if you expect more than 100 files
    });

  if (listError) {
    throw listError;
  }

  // If files exist, delete them
  if (files?.length > 0) {
    const filePaths = files.map((file) => `${path}/${file.name}`);
    // Delete all files in the folder
    const { error: deleteError } = await supabase.storage
      .from("listings_bucket")
      .remove(filePaths);

    if (deleteError) {
      throw deleteError;
    }
  }
};

// DELETE LISTING FROM SUPABASE
export const deleteListing = async ({ listingId }: { listingId: string }) => {
  if (!listingId) {
    throw new Error("Missing listingId");
  }
  const { data, error } = await supabase
    .from("listings")
    .delete()
    .eq("listing_id", listingId);

  if (error) {
    throw error;
  }

  return data;
};
