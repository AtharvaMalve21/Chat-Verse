import React, { useContext } from 'react';
import { UserContext } from "../context/UserContext.jsx";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  BriefcaseIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import { Pencil, Trash2 } from 'lucide-react';
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useContext(UserContext);
  const URI = import.meta.env.VITE_BACKEND_URI;
  const navigate = useNavigate();

  const deleteUserProfile = async () => {
    try {
      const { data } = await axios.delete(URI + "/api/v1/user/profile", {
        withCredentials: true,
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2e] to-[#2d2d44] flex items-center justify-center px-4 py-12">
      <div className="relative bg-[#2c2c3f] text-white w-full max-w-xl rounded-2xl shadow-2xl p-8 transition duration-300">

        {/* Action Icons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => navigate("/edit-profile")}
            className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow-md transition"
            title="Edit Profile"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={deleteUserProfile}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition"
            title="Delete Profile"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar, Name, Email */}
        <div className="flex flex-col items-center gap-4">
          {user?.additionalDetails?.profileImage ? (
            <img
              src={user.additionalDetails.profileImage}
              alt={user.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-violet-600 shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-violet-600 text-white flex items-center justify-center text-4xl font-bold uppercase border-4 border-violet-600 shadow-lg">
              {user?.name?.charAt(0)}
            </div>
          )}
          <h2 className="text-2xl font-semibold">{user?.name}</h2>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <EnvelopeIcon className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
        </div>

        <hr className="my-6 border-gray-700" />

        {/* Profile Info */}
        {user?.additionalDetails ? (
          <div className="space-y-5 text-sm">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-violet-400" />
              <p className="text-gray-400 w-28">Gender:</p>
              <p className="font-medium">{user.additionalDetails.gender}</p>
            </div>

            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-violet-400" />
              <p className="text-gray-400 w-28">Contact:</p>
              <p className="font-medium">{user.additionalDetails.contact}</p>
            </div>

            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-violet-400" />
              <p className="text-gray-400 w-28">Address:</p>
              <p className="font-medium">{user.additionalDetails.address}</p>
            </div>

            <div className="flex items-center gap-3">
              <BriefcaseIcon className="w-5 h-5 text-violet-400" />
              <p className="text-gray-400 w-28">Profession:</p>
              <p className="font-medium">{user.additionalDetails.profession}</p>
            </div>

            <div className="flex items-start gap-3">
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mt-1 text-violet-400" />
              <p className="text-gray-400 w-28">Bio:</p>
              <p className="font-medium">
                {user.additionalDetails.bio || "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-6">
            <p>No profile details found.</p>
            <p className="text-sm mt-1">Click the ✏️ icon above to add them.</p>
          </div>
        )}

        {/* Home Button */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-md text-sm font-medium transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
