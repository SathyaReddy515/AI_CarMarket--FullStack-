"use client"
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import z, { set } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { addCar, processCarImageWithAI } from '@/actions/cars';
import { useRouter } from 'next/navigation';
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid","Plug-in Hybrid"];
const transmission = ["Manual", "Automatic", "Semi-Automatic"];
const bodyTypes = ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Wagon", "pickup",];

const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];
const AddCarForm = () => {

const [activeTab, setActiveTab] = useState("ai");
const [UploadedImages, setUploadedImages] = useState([]);
const [imageError, setImageError] = useState("");
const [imagePreview, setImagePreview] = useState(null);
const [uploadedAiImage, setUploadedAiImage] = useState(null);
const router = useRouter();
const carFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year:z.string().refine((val) => {
    const year = parseInt(val);
    return(
      !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1  
    );
  }, " Please enter a valid year"),
  price:z.string().min(1, "Price is required"),
  mileage: z.string().min(1, "Mileage is required"),
  color: z.string().min(1, "Color is required"),
  bodyType: z.string().min(1, "Body type is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission type is required"),
  seats :z.string().optional(),
  description: z.string().min(10, "Description is required").max(500, "Description should be at most 500 characters"),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
  featured: z.boolean().default(false),
})


const {register,
  setValue,
  getValues,
  formState: { errors},
  handleSubmit,
  watch,
} = useForm({
  resolver: zodResolver(carFormSchema),
  defaultValues: {
    make: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    color: '',
    bodyType: '',
    fuelType: '',
    transmission: '',
    seats: '',
    description: '',
    status: 'AVAILABLE',
    featured: false,
  },
});

useEffect(() => {
  register("fuelType");
  register("transmission");
  register("bodyType");
  register("status");
}, [register]);

const onAiDrop = (acceptedFiles) => {
    // Do something with the files
    const file = acceptedFiles[0];
    if (file) {
      if(file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setUploadedAiImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        toast.success("Image uploaded successfully. Proceed to extract details.");
      };
      reader.readAsDataURL(file);
  }
}

 const {
    getRootProps:getAiRootProps, 
    getInputProps:getAiInputProps,
  } = useDropzone({
    onDrop:onAiDrop,
    accept: {"image/*": [".jpeg",".jpg",".png",".webp"],
  },
 maxFiles:1,
 multiple:false,
  })

  const{
    loading:processImageLoading,
    data:processImageResult,
    fn:processImageFn,
    error:processImageError,
  }=useFetch(processCarImageWithAI);

const processWithAI = async () => {

  if (!uploadedAiImage) {
    toast.error("Please upload an image to extract details");
    return;
  }
  await processImageFn(uploadedAiImage);
}

useEffect(() => {
  if (processImageError) {
    toast.error(processImageError.message ||"AI processing failed");
  }
},[processImageError] );

useEffect(() => {
  if( processImageResult?.success) {
    const carDetails = processImageResult.data;
    setValue("make", String(carDetails.make || ""));
    setValue("model", String(carDetails.model || ""));
    setValue("year", String(carDetails.year || ""));
    setValue("color", String(carDetails.color || ""));
    setValue("bodyType", String(carDetails.bodyType || ""));
    setValue("fuelType", String(carDetails.fuelType || ""));
    setValue("price", String(carDetails.price || ""));
    setValue("mileage", String(carDetails.mileage || ""));
    setValue("transmission", String(carDetails.transmission || ""));
    setValue("description", String(carDetails.description || ""));


    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImages((prev) => [...prev, e.target.result]);
    }
    reader.readAsDataURL(uploadedAiImage);
    toast.success("Car details extracted successfully!",{
    description: `Detected ${carDetails.make} ${carDetails.model} ${carDetails.year} with ${Math.round(carDetails.confidence * 100)}% confidence.`, 
    });

    setActiveTab("manual");

  }
},[processImageResult,uploadedAiImage]);
const {
  data:addCarResult,
  loading:addCarLoading,
  fn:addCarFn,
} = useFetch(addCar);

useEffect(() => {
  if (addCarResult?.success) {
    toast.success("Car added successfully!");
    router.push('/admin/cars');
  }
}, [addCarResult,addCarLoading]);

const onSubmit = async (data) => {
  if (UploadedImages.length === 0) {
    setImageError("Please upload at least one image of the car.");
    return;
  }
  
  // Clean string inputs before parsing to prevent NaN errors (e.g. from AI details)
  const cleanNumber = (val) => {
    if (val === undefined || val === null) return "";
    return val.toString().replace(/[^0-9.]/g, "");
  };
  
  const cleanInt = (val) => {
    if (val === undefined || val === null) return "";
    return val.toString().replace(/[^0-9]/g, "");
  };

  const carData = {
    ...data,
    year: parseInt(cleanInt(data.year)) || new Date().getFullYear(),
    price: parseFloat(cleanNumber(data.price)) || 0,
    mileage: parseInt(cleanInt(data.mileage)) || 0,
    seats: data.seats ? (parseInt(cleanInt(data.seats)) || null) : null,
  };

  await addCarFn({carData, images: UploadedImages});
};
  
  const onMultiImageDrop = (acceptedFiles) => {
    // Do something with the files
   const validFiles = acceptedFiles.filter((file) => { if (file.size > 5 * 1024 * 1024){
    toast.error(`${file.name} exceeds the 5MB size limit and was not added.`);  
    return false;
   }
   return true;
  });

  if(validFiles.length === 0) return;
   const newImages = []
   validFiles.forEach((file) => {
    const reader = new FileReader();
          reader.onload = (e) => {
            newImages.push(e.target.result);

            if(newImages.length === validFiles.length) {
              setUploadedImages((prev) => [...prev, ...newImages]);
              setImageError("");
              toast.success(`Successfully uploaded ${validFiles.length} images`)
            }
          };
          reader.readAsDataURL(file);
});
  }
  const {
    getRootProps:getMultiImageRootProps, 
    getInputProps:getMultiImageInputProps,
  } = useDropzone({
    onDrop:onMultiImageDrop,
    accept: {"image/*": [".jpeg",".jpg",".png",".webp"],
  },
 multiple:true,
  })

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }
  return (
    <div>
      <Tabs defaultValue="account" className="mt-6"
      value={activeTab}
      onValueChange={setActiveTab}
      >
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
    <TabsTrigger value="ai">AI Upload</TabsTrigger>
  </TabsList>

  <TabsContent value="manual" className="mt-6">

    <Card>
  <CardHeader>
    <CardTitle>Car Details</CardTitle>
    <CardDescription> Enter the details of the car you want to add. </CardDescription>
  </CardHeader>
  <CardContent>
    <form onSubmit ={handleSubmit(onSubmit, (err) => {
      console.error("Form validation errors raw:", JSON.stringify(err, null, 2));
      const errorMessages = Object.keys(err).reduce((acc, key) => {
        acc[key] = err[key]?.message || "Invalid value";
        return acc;
      }, {});
      console.error("Form validation errors:", errorMessages);
      toast.error(`Please correct the following: ${Object.values(errorMessages).join(", ")}`);
    })} className="space-y-6">

     <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
     <div className='space-y-2'>
      <Label htmlFor='make'>Make</Label>
      <Input id='make' placeholder='e.g. Toyota' {...register('make')}  className={errors.make ? "border-red-400":""}/>
      {errors.make && (<p className='text-sm text-red-600 mt-1'>{errors.make.message}</p>)}
     </div>
     <div className='space-y-2'>
      <Label htmlFor='model'>Model</Label>
      <Input id='model' placeholder='e.g. Camry' {...register('model')}  className={errors.model ? "border-red-400":""}/>
      {errors.model && (<p className='text-sm text-red-600 mt-1'>{errors.model.message}</p>)}
     </div>
     <div className='space-y-2'>
      <Label htmlFor='year'>Year</Label>
      <Input id='year' placeholder='e.g. 2022' {...register('year')}  className={errors.year ? "border-red-400":""}/>
      {errors.year && (<p className='text-sm text-red-600 mt-1'>{errors.year.message}</p>)}
     </div>

     <div className='space-y-2'>
      <Label htmlFor='price'>Price ($)</Label>
      <Input id='price' placeholder='e.g. 25000' {...register('price')}  className={errors.price ? "border-red-400":""}/>
      {errors.price && (<p className='text-sm text-red-600 mt-1'>{errors.price.message}</p>)}
     </div>

     <div className='space-y-2'>
      <Label htmlFor='mileage'>Mileage</Label>
      <Input id='mileage' placeholder='e.g. 15000' {...register('mileage')}  className={errors.mileage ? "border-red-400":""}/>
      {errors.mileage && (<p className='text-sm text-red-600 mt-1'>{errors.mileage.message}</p>)}
     </div>
          
          
      <div className='space-y-2'>
      <Label htmlFor='color'>Color</Label>
      <Input id='color' placeholder='e.g. Blue' {...register('color')}  className={errors.color ? "border-red-400":""}/>
      {errors.color && (<p className='text-sm text-red-600 mt-1'>{errors.color.message}</p>)}
     </div>
      
    <div className='space-y-2'>
    <Label htmlFor='fuelType'>Fuel Type</Label>
     <Select onValueChange ={ (value) => setValue("fuelType", value)}   defaultValue = {getValues("fuelType")}>
     <SelectTrigger className= {errors.fuelType?"border-red-500": ""}>
     <SelectValue placeholder="Select fuel type" />
     </SelectTrigger>
     <SelectContent> {fuelTypes.map((type)=>{
     return (<SelectItem key = {type} value={type}>{type}</SelectItem>)
     })}
    </SelectContent>
    </Select>
      {errors.fuelType && (<p className='text-sm text-red-600 mt-1'>{errors.fuelType.message}</p>)}
     </div>


     <div className='space-y-2'>
    <Label htmlFor='transmission'>Transmission</Label>
     <Select onValueChange ={ (value) => setValue("transmission", value)}   defaultValue = {getValues("transmission")}>
     <SelectTrigger className= {errors.transmission?"border-red-500": ""}>
     <SelectValue placeholder="Select transmission" />
     </SelectTrigger>
     <SelectContent> {transmission.map((type)=>{
     return (<SelectItem key = {type} value={type}>{type}</SelectItem>)
     })}
    </SelectContent>
    </Select>
      {errors.transmission && (<p className='text-sm text-red-600 mt-1'>{errors.transmission.message}</p>)}
     </div>

     <div className='space-y-2'>
    <Label htmlFor='bodyType'>Body Type</Label>
     <Select onValueChange ={ (value) => setValue("bodyType", value)}   defaultValue = {getValues("bodyType")}>
     <SelectTrigger className= {errors.bodyType?"border-red-500": ""}>
     <SelectValue placeholder="Select body Type" />
     </SelectTrigger>
     <SelectContent> {bodyTypes.map((type)=>{
     return (<SelectItem key = {type} value={type}>{type}</SelectItem>)
     })}
    </SelectContent>
    </Select>
      {errors.bodyType && (<p className='text-sm text-red-600 mt-1'>{errors.bodyType.message}</p>)}
     </div>


     <div className='space-y-2'>
      <Label htmlFor='seats'>Number of Seats{" "}
        <span className='text-sm text-gray-500'>(optional)</span>
      </Label>
      <Input id='seats' placeholder='e.g. 5' {...register('seats')}/>
     </div>

     <div className='space-y-2'>
    <Label htmlFor='status'>Status</Label>
     <Select onValueChange ={ (value) => setValue("status", value)}   defaultValue = {getValues("status")}>
     <SelectTrigger>
     <SelectValue placeholder="Select status" />
     </SelectTrigger>
     <SelectContent> {carStatuses.map((status)=>(
     <SelectItem key = {status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</SelectItem>)
     )}
    </SelectContent>
    </Select>
     </div>
     </div>
    <div className='space-y-2'>
      <Label htmlFor='description'>Description</Label>
      <Textarea id='description' placeholder='e.g. Enter detailed description of the car...' {...register('description')}  className={`min-h-32 ${errors.description ? "border-red-500":""}`}/>
      {errors.description && (
        <p className='text-xs text-red-600 mt-1'>{errors.description.message}</p>)}
     </div>

     <div className='flex items-start space-x-3 space-y-0 rounded-md border p-4'>
      <Checkbox 
      id ='featured'
      checked={watch("featured")}
      onCheckedChange ={ (checked) => {
        setValue("featured", checked)
      }}
      />
      <div className='space-y-1 leading-none'>
      <Label htmlFor='featured'> Featured this Car</Label>
      <p className='text-sm text-gray-500'>
        Mark this car as featured to highlight it on the main page.
      </p>
     </div>
      </div>
    <div>
      <Label htmlFor='images' 
      className={imageError ? "text-red-500" : ""}>
      Car Images{"  "}{imageError && <span className='text-red-500'>*</span>}
      </Label>
      <div {...getMultiImageRootProps()} className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer mt-2 ${
        imageError ? "border-red-500": "border-gray-300"}`}>
          <input {...getMultiImageInputProps()} />
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-2">
                     "Drag & drop  or upload multiple car images here"
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      (JPG, PNG,Webp, max 5MB each)
                    </p>
                  </div>
      </div>  
      {imageError && (
        <p className='text-xs text-red-600 mt-1'>{imageError}</p>  
      )} 
    </div>


    {UploadedImages.length > 0 && (
      <div className='mt-4'>
        <h3 className='text-sm font-medium mb-2'>Uploaded Images ({UploadedImages.length})</h3>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  lg:grid-cols-5 gap-4'>
          {UploadedImages.map((image, index) =>{
            return (
            <div key={index} className='relative group'>
              <Image
              src = {image}
              alt = {`Car image ${index + 1}`}
              height = {50}
              width = {50}
              className = "h-28 w-full object-cover rounded-md mb-2"
              priority
              />
              <Button
              type = "button"
              variant = "destructive"
              size = "icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick ={() => removeImage(index)}
              ><X className='h-3 w-3'/></Button>
        </div>
            );
          })}
        </div>
      </div>
   )}
    <Button type='submit' className='w-full md:w-auto ' disabled={addCarLoading}>
      {addCarLoading ? (
      <>
      <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
       Adding Car...
       </>
       ):(
        "Add Car"
       )}
      </Button>
    </form>
  </CardContent>
</Card>
  </TabsContent>
  <TabsContent value="ai" className="mt-6">
   <Card>
  <CardHeader>
    <CardTitle>AI-Powered Car Details Extraction</CardTitle>
    <CardDescription>Upload an image of a car and let Gemini AI extract its details</CardDescription>
  </CardHeader>
  <CardContent>
<div className="flex flex-col items-center space-y-6 max-w-3xl mx-auto">
  {/* Upload / Preview Card */}
  <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full">
    {imagePreview ? (
      <>
        {/* Image Preview */}
        <div className="w-full h-64 flex items-center justify-center overflow-hidden rounded-md mb-4 bg-gray-50">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => {
              setUploadedAiImage(null);
              setImagePreview(null);
              toast.info("AI image removed");
            }}
          >
            Remove
          </Button>

          <Button
            size="sm"
            className="flex-1 flex items-center justify-center"
            onClick={processWithAI}
            disabled={processImageLoading}
          >
            {processImageLoading ? ( // replace 'true' with isProcessing state
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Processing...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Extract Details
              </>
            )}
          </Button>
        </div>
      </>
    ) : (
      <div
        {...getAiRootProps()}
        className="cursor-pointer mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg 
                   hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 flex flex-col items-center w-full"
      >
        <input {...getAiInputProps()} className="sr-only" />
        <Camera className="h-12 w-12 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors duration-200" />
        <p className="text-gray-700 text-sm mt-1 text-center">
          Drag & drop or click to upload a clear image of your car
        </p>
        <p className="text-gray-500 text-xs mt-1 text-center">
          Supported formats: JPG, PNG, WebP | Max size: 5MB
        </p>
      </div>
    )}
  </div>

  {/* Guidelines - Full width and left aligned */}
  <div className="flex flex-col bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full space-y-4">
    {/* How it works */}
    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
      <h3 className="font-semibold mb-2 text-gray-800">How it works</h3>
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 text-left">
        <li>Upload a clear image of the car.</li>
        <li>Gemini AI extracts details such as make, model, year, and color.</li>
        <li>Review and correct any details if necessary.</li>
        <li>Submit to add the car to your inventory.</li>
      </ol>
    </div>

    {/* Tips for best results */}
    <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
      <h3 className="font-semibold mb-2 text-gray-800">Tips for Best Results</h3>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 text-left">
        <li>Use high-quality, well-lit images with the car fully visible.</li>
        <li>Avoid multiple cars or busy backgrounds.</li>
        <li>Ensure details like badges and license plates are clear.</li>
        <li>Images from multiple angles improve accuracy.</li>
      </ul>
    </div>
  </div>
</div>
  </CardContent>
</Card>
    </TabsContent>
</Tabs>
    </div>
  )
}
export default AddCarForm