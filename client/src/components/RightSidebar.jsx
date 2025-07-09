import React, { useContext } from 'react';
import assets from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { MessageContext } from '../context/MessageContext';

const RightSidebar = ({ selectedUser }) => {
    const { messages } = useContext(MessageContext);
    const { setUser, setIsLoggedIn } = useContext(UserContext);

    const URI = import.meta.env.VITE_BACKEND_URI;
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const { data } = await axios.get(`${URI}/api/v1/auth/logout`, {
                withCredentials: true,
            });

            if (data.success) {
                setUser(null);
                setIsLoggedIn(false);
                toast.success(data.message);
                navigate('/login');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Logout failed');
        }
    };

    if (!selectedUser) return null;

    const { profileImage, profession, bio } = selectedUser.additionalDetails || {};

    return (
        <div className="bg-[#8185B2]/10 text-white w-full max-w-[300px] border-l border-gray-700 overflow-y-auto max-md:hidden">
            {/* User Info */}
            <div className="pt-16 flex flex-col items-center px-6 text-center">
                {profileImage ? (
                    <img
                        src={profileImage}
                        className="w-[50px] h-[50px] rounded-full object-cover"
                        alt={selectedUser.name}
                    />
                ) : (
                    <div className="w-[50px] h-[50px] rounded-full bg-violet-600 text-white flex items-center justify-center font-semibold text-sm uppercase">
                        {selectedUser.name?.charAt(0)}
                    </div>
                )}

                <h1 className="mt-4 text-xl font-semibold flex items-center gap-2">
                    {selectedUser.name}
                    <span
                        className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                        title="Online"
                    ></span>
                </h1>

                {profession && (
                    <p className="text-sm text-gray-300 mt-1">{profession}</p>
                )}

                {bio && (
                    <p className="mt-4 text-sm text-gray-400 leading-5 bg-white/5 p-3 rounded-lg w-full">
                        {bio}
                    </p>
                )}
            </div>

            <hr className="border-[#ffffff50] my-4" />

            {/* Media Section */}
            <div className="px-5 text-xs flex flex-col gap-3 pb-8">
                <p className="text-sm font-semibold text-white/80">Media</p>
                <div className="max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-3 pr-1">
                    {messages
                        .filter((msg) => msg.image)
                        .map((msg) => (
                            <div
                                className="cursor-pointer rounded hover:opacity-80 transition"
                                key={msg._id}
                                onClick={() => window.open(msg.image, '_blank')}
                            >
                                <img
                                    src={msg.image}
                                    alt={`media-${msg._id}`}
                                    className="rounded-md w-full h-auto"
                                />
                            </div>
                        ))}
                </div>

                {/* Logout Button */}
                <button
                    onClick={logoutHandler}
                    className="mt-3 w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm font-light py-2 rounded-full hover:scale-[1.02] transition-transform"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default RightSidebar;
