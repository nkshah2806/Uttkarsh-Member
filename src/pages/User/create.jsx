import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { ImageUploader } from "@/components/image-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import { getUserById, updateUser } from "@/services/userService";
import { Calendar22 } from "@/components/Calendar22";
import { useLanguage } from "@/context/LanguageContext";

export default function UserEdit() {
  const { t } = useLanguage();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [defaultImage, setDefaultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [gender, setGender] = useState();
  const [birthDate, setBirthDate] = useState();
  const navigate = useNavigate();
  const { id } = useParams();

  // ...existing code...
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const updatedUser = {
        isActive,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phoneNumber: data.phoneNumber,
        age: data.age,
        birthDate: birthDate,
        gender: gender,
      };
      const response = await updateUser(id, updatedUser);
      // Update localStorage if the updated user is the logged-in user
      const currentUser = JSON.parse(localStorage.getItem("UserDetails"));
      if (currentUser && currentUser._id === id) {
        // Merge updated fields into currentUser
        const newUserDetails = { ...currentUser, ...updatedUser };
        localStorage.setItem("UserDetails", JSON.stringify(newUserDetails));
      }
      toast.success(response.meta.message || t("userUpdated"));
      navigate("/user");
    } catch (error) {
      toast.error(
        error?.response?.data?.meta?.message || t("failedUpdateUser")
      );
    } finally {
      setLoading(false);
    }
  };
  // ...existing code...

  const getUserDetails = async () => {
    try {
      if (id) {
        const user = await getUserById(id);
        setValue("firstname", user?.firstname);
        setValue("lastname", user?.lastname);
        setValue("email", user?.email);
        setValue("phoneNumber", user?.phoneNumber);
        setValue("age", user?.age);
        setIsActive(user?.isActive);
        setDefaultImage(user?.image);
        setGender(user?.gender);
        setBirthDate(user?.birthDate ? new Date(user.birthDate) : null);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error(t("failedFetchUser"));
    }
  };

  useEffect(() => {
    if (id) {
      getUserDetails();
    }
  }, [id]);

  const handleIsActive = (value) => {
    setGender(value);
  };

  // const handleUploadProfile = async (file) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("userId", id);
  //     formData.append("profileImage", file);

  //     const response = await axiosInstance.post(
  //       `user/uploadProfileImage`,
  //       formData,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       }
  //     );
  //     toast.success(response.data.meta.message);
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     toast.error("Upload failed. Try again.");
  //   }
  // };

  // ...existing code...
  const handleUploadProfile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("userId", id);

      formData.append("profileImage", file);

      const response = await axiosInstance.post(
        `user/uploadProfileImage`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(response.data.meta.message);

      // Update localStorage if the updated user is the logged-in user
      const currentUser = JSON.parse(localStorage.getItem("UserDetails"));
      if (currentUser && currentUser._id === id) {
        // The new image path should come from the response, adjust as per your API
        const newImage = response.data.data?.image || file.name;
        const newUserDetails = { ...currentUser, image: newImage };
        localStorage.setItem("UserDetails", JSON.stringify(newUserDetails));
      }
      // Optionally update the defaultImage state
      setDefaultImage(response.data.data?.image || file.name);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("uploadFailed"));
    }
  };
  // ...existing code...

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("editUser")}</CardTitle>
        <CardDescription>{t("updateUserInfo")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ImageUploader
            label={t("profilePicture")}
            defaultImage={defaultImage}
            apiUrl="user/uploadProfileImage"
            handleUploadProfile={handleUploadProfile}
            multiple={false}
          />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 w-full items-center gap-4">
            <div className="col-span-3 mb-auto flex flex-col space-y-1.5">
              <Label htmlFor="firstname">
                {t("firstName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstname"
                type="text"
                placeholder={t("enterFirstName")}
                maxLength={30} // Character limit for first name
                {...register("firstname", {
                  required: t("firstNameRequired"),
                  maxLength: {
                    value: 30,
                    message: t("firstNameMax"),
                  },
                  pattern: {
                    value: /^[A-Za-z\s-]+$/,
                    message: t("firstNamePattern"),
                  },
                })}
              />
              {errors.firstname && (
                <span className="text-red-500 text-sm">
                  {errors.firstname.message}
                </span>
              )}
            </div>
            <div className="col-span-3 mb-auto flex flex-col space-y-1.5">
              <Label htmlFor="lastname">
                {t("lastName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastname"
                type="text"
                placeholder={t("enterLastName")}
                maxLength={30} // Character limit for last name
                {...register("lastname", {
                  required: t("lastNameRequired"),
                  maxLength: {
                    value: 30,
                    message: t("lastNameMax"),
                  },
                  pattern: {
                    value: /^[A-Za-z\s-]+$/,
                    message: t("lastNamePattern"),
                  },
                })}
              />
              {errors.lastname && (
                <span className="text-red-500 text-sm">
                  {errors.lastname.message}
                </span>
              )}
            </div>
            <div className="col-span-3 mb-auto flex flex-col space-y-1.5">
              <Label htmlFor="email">
                {t("email")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("enterEmail")}
                maxLength={50} // Character limit for email
                {...register("email", {
                  required: t("emailRequired"),
                  maxLength: {
                    value: 50,
                    message: t("emailMax"),
                  },
                  pattern: {
                    value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
                    message: t("emailPattern"),
                  },
                })}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="col-span-3 mb-auto flex flex-col space-y-1.5">
              <Label htmlFor="phoneNumber">
                {t("phoneLabel")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder={t("enterPhone")}
                maxLength={10} // Digit limit for phone number
                {...register("phoneNumber", {
                  required: t("phoneRequired"),
                  maxLength: {
                    value: 10,
                    message: t("phoneMax"),
                  },
                  minLength: {
                    value: 10,
                    message: t("phoneDigits"),
                  },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: t("phoneOnlyDigits"),
                  },
                })}
              />
              {errors.phoneNumber && (
                <span className="text-red-500 text-sm">
                  {errors.phoneNumber.message}
                </span>
              )}
            </div>
            <div className="col-span-3 mb-auto flex flex-col space-y-1.5">
              <Label htmlFor="gender">{t("gender")}</Label>
              <Select onValueChange={handleIsActive} value={gender}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectGender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="Male" value="Male">
                    {t("male")}
                  </SelectItem>
                  <SelectItem key="Female" value="Female">
                    {t("female")}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <span className="text-red-500 text-sm">
                  {errors.gender.message}
                </span>
              )}
            </div>
            {/* <div className="col-span-3 flex flex-col space-y-1.5">
              <Label htmlFor="birthDate">Date of Birth</Label>
              <Calendar22
                value={birthDate}
                onValueChange={(value) => setBirthDate(value)}
                placeholder="Select Birth Date"
              />
              {errors.birthDate && (
                <span className="text-red-500 text-sm">
                  {errors.birthDate.message}
                </span>
              )}
            </div> */}
            <div className="col-span-3 mb-auto flex flex-col space-y-1.5">
              <Label htmlFor="age">
                {t("age")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                placeholder={t("enterAge")}
                maxLength={3}
                {...register("age", {
                  required: t("ageRequired"),
                  max: {
                    value: 100,
                    message: t("ageMax"),
                  },
                  min: {
                    value: 1,
                    message: t("ageMin"),
                  },
                })}
              />
              {errors.age && (
                <span className="text-red-500 text-sm">
                  {errors.age.message}
                </span>
              )}
            </div>
          </div>
          <CardFooter className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate("/user")}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("saving") : t("update")}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
