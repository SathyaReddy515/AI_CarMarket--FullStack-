"use client"
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Camera, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { processImageSearch } from '@/actions/home'
import useFetch from '@/hooks/use-fetch'
import { useAuth } from '@clerk/nextjs'


const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.75) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const HomeSearch = () => {
const { userId } = useAuth();

const[searchTerm,setSearchTerm] = useState("")
const[isImageSearchActive,setIsImageSearchActive] = useState(false)
const [searchImage, setSearchImage] = useState(null)
const [imagePreview, setImagePreview] = useState("")
const [isUploading, setIsUploading] = useState(false)
const [isProcessing, setIsProcessing] = useState(false)

const router = useRouter();

const {
  loading:isprocessing,
  fn:processImageFn,
  data:processResult,
  error:processError
} = useFetch(processImageSearch);


const handleTextSubmit = (e) => {
  e.preventDefault();
  if (!userId) {
    toast.error("Please sign in to search for cars.");
    router.push("/sign-in");
    return;
  }
  if(!searchTerm) {
    toast.error("Please enter a search term");
    return;
  }
  router.push(`/cars?search=${encodeURIComponent(searchTerm)}`); // In real app, use image URL or ID

}
const handleImageSearch = async(e) => {
  e.preventDefault();
  if (!userId) {
    toast.error("Please sign in to search for cars.");
    router.push("/sign-in");
    return;
  }
  if(!searchImage) {
    toast.error("Please upload an image first");
    return;
  }
  // ai logic here
  await processImageFn({searchImage});
}
   
useEffect(() => {
  if(processError){
    toast.error("Failed to analyze image:" +(processError.message || "Unknown error"));
  }}, [processError]);

useEffect(() => {
  if(processResult?.success){
   const params = new URLSearchParams();

  if(processResult.data.make) params.set("make", processResult.data.make);
  if(processResult.data.bodyType) params.set("bodyType", processResult.data.bodyType);
  if(processResult.data.color) params.set("search", processResult.data.color);
  router.push(`/cars?${params.toString()}`);
  }
}, [processResult]);

  const onDrop = async (acceptedFiles) => {
    // Do something with the files
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      const toastId = toast.loading("Optimizing image for search...");
      
      try {
        const compressedFile = await compressImage(file, 1024, 1024, 0.75);
        setSearchImage(compressedFile);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setIsUploading(false);
          toast.success("Image optimized and uploaded successfully. Click 'Search with this Image' to proceed.", { id: toastId });
        };
        reader.onerror = () => {
          setIsUploading(false);
          toast.error("Failed to read file", { id: toastId });
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.error("Search image optimization failed:", err);
        setSearchImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setIsUploading(false);
          toast.error("Optimization failed. Using original file.", { id: toastId });
        };
        reader.onerror = () => {
          setIsUploading(false);
          toast.error("Failed to read file", { id: toastId });
        };
        reader.readAsDataURL(file);
      }
  }
}
  const {getRootProps, getInputProps, isDragActive,isDragReject} = useDropzone({onDrop,
    accept: {"image/*": [".jpeg",".jpg",".png"],
  },
  maxFiles:1,
  })

  return (
    <div>
      <form onSubmit={handleTextSubmit}>
        <div className='relative flex items-center max-w-3xl mx-auto'>
          <Input
          type ="text"
          placeholder="Enter make,model,or use our AI Image Search..."
          value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm"/>

            <div className='absolute right-[100px]'>
               <Camera
              size={35}
              onClick={() => setIsImageSearchActive(!isImageSearchActive)}
              className="cursor-pointer rounded-xl p-1.5"
              style={{
                background: isImageSearchActive ? "black" : "",
                color: isImageSearchActive ? "white" : "",
              }}
            />
            </div>
            <Button type="submit" className="absolute right-2 rounded-full">
            Search
          </Button>
        </div>
      </form>
      {isImageSearchActive && (
        <div className="mt-4">
          <form onSubmit={handleImageSearch} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Car preview"
                    className="h-40 object-contain mb-4"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                      toast.info("Image removed");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-2">
                      {isDragActive && !isDragReject
                        ? "Leave the file here to upload"
                        : "Drag & drop a car image or click to select"}
                    </p>
                    {isDragReject && (
                      <p className="text-red-500 mb-2">Invalid image type</p>
                    )}
                    <p className="text-gray-400 text-sm">
                      Supports: JPG, PNG (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {imagePreview && (
              <Button
             
                type="submit"
                className="w-full mt-2"
                disabled={isUploading || isprocessing}
              >
                {isUploading
                  ? "Uploading..."
                  : isprocessing
                  ? "Analyzing image..."
                  : "Search with this Image"}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  )
}

export default HomeSearch