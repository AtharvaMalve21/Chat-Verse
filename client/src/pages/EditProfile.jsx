import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";


const EditProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const URI = import.meta.env.VITE_BACKEND_URI;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    gender: "",
    contact: "",
    address: "",
    bio: "",
    profession: "",
  });

  const [preview, setPreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.additionalDetails) {
      const { gender, contact, address, bio, profession, profileImage } =
        user.additionalDetails;

      setFormData({
        gender: gender || "",
        contact: contact || "",
        address: address || "",
        bio: bio || "",
        profession: profession || "",
      });
      setPreview(profileImage || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact" && value.length > 10) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contact && formData.contact.length !== 10) {
      toast.error("Contact number must be exactly 10 digits.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    if (profileImage) data.append("profileImage", profileImage);

    try {
      setLoading(true);
      const res = await axios.put(`${URI}/api/v1/user/edit-profile`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setUser((prev) => ({ ...prev, additionalDetails: res.data.data }));
        navigate("/profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1e2e] to-[#2d2d44] px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-[#2c2c3f] w-full max-w-xl text-white p-8 rounded-2xl shadow-2xl space-y-6"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Edit Profile</h2>

        <div className="flex flex-col items-center gap-4">
          {/* Avatar Wrapper with Camera */}
          <div className="relative w-24 h-24">
            {preview ? (
              <img
                src={preview}
                alt="Profile Preview"
                className="w-full h-full rounded-full object-cover border-4 border-violet-500 shadow"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-violet-600 text-white flex items-center justify-center text-3xl font-bold uppercase border-4 border-violet-500 shadow">
                {user?.name?.charAt(0)}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              id="profileImageUpload"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Camera Icon Overlay */}
            <label
              htmlFor="profileImageUpload"
              className="absolute bottom-1 right-1 bg-black bg-opacity-60 p-1 rounded-full cursor-pointer hover:bg-opacity-80 transition"
              title="Change Profile Picture"
            >
              <Camera className="w-4 h-4 text-white" />
            </label>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-600 rounded-md px-3 py-2 mt-1 text-white"
            >
              <option value="" disabled>
                Select
              </option>
              <option className="bg-[#2c2c3f]" value="Male">Male</option>
              <option className="bg-[#2c2c3f]" value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-sm">Contact</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter contact number"
              className="w-full bg-transparent border border-gray-600 rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              className="w-full bg-transparent border border-gray-600 rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm">Profession</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="Enter profession"
              className="w-full bg-transparent border border-gray-600 rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write something about yourself"
              rows="3"
              className="w-full bg-transparent border border-gray-600 rounded-md px-3 py-2 mt-1"
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 px-6 py-2 rounded-md text-white font-medium transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditProfile;
