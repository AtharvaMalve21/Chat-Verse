import React, { useContext, useEffect, useState } from 'react';
import assets from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserContext } from '../context/UserContext';
import { debounce } from "lodash";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
    const { setUser, setIsLoggedIn, isLoggedIn } = useContext(UserContext);
    const URI = import.meta.env.VITE_BACKEND_URI;
    const navigate = useNavigate();

    const [dropDownMenu, setDropDownMenu] = useState(false);

    const toggleDropDown = () => {
        setDropDownMenu((prev) => !prev)
    }

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);

    const logoutHandler = async () => {
        try {
            const { data } = await axios.get(URI + "/api/v1/auth/logout", { withCredentials: true });
            if (data.success) {
                setUser(null);
                setIsLoggedIn(false);
                toast.success(data.message);
                navigate("/login");
            }
        } catch (err) {
            toast.error(err.response.data.message);
        }
    };

    const fetchChatUsers = async () => {
        try {
            const { data } = await axios.get(URI + "/api/v1/user", { withCredentials: true });
            if (data.success) setUsers(data.data);
        } catch (err) {
            console.log(err.response.data.message);
        }
    };

    useEffect(() => {
        fetchChatUsers();
    }, [isLoggedIn]);

    const handleSearch = debounce(async (query) => {
        if (!query.trim()) {
            setFilteredUsers([]);
            return;
        }
        try {
            const { data } = await axios.get(`${URI}/api/v1/user/search-user?name=${query}`, {
                withCredentials: true,
            });
            if (data.success) setFilteredUsers(data.data);
        } catch (err) {
            console.log("Search error:", err.response?.data?.message);
        }
    }, 300);

    const onInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        handleSearch(value);
    };

    const displayUsers = searchTerm.trim() ? filteredUsers : users;

    return (
        <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser && "max-md:hidden"}`}>
            {/* Header */}
            <div className='pb-5'>
                <div className='flex justify-between items-center'>
                    <img src={assets.logo} alt="" className='max-w-40' />
                    <div className="relative">
                        <span onClick={toggleDropDown} className="cursor-pointer inline-block">
                            <img src={assets.menu_icon} alt="Menu" className="w-5 h-5" />
                        </span>

                        {/* Dropdown Menu */}
                        {dropDownMenu && (
                            <div className="absolute top-full right-0 mt-2 w-40 bg-[#2a2348] text-white border border-gray-600 rounded-lg shadow-lg z-20 animate-fadeIn">
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-sm hover:bg-violet-600 hover:text-white transition-all duration-150"
                                >
                                    My Profile
                                </Link>
                                <hr className="border-gray-500" />
                                <p
                                    onClick={logoutHandler}
                                    className="px-4 py-2 text-sm cursor-pointer hover:bg-red-600 hover:text-white transition-all duration-150"
                                >
                                    Logout
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Input */}
                <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5 relative'>
                    <img src={assets.search_icon} className='w-3' alt="" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={onInputChange}
                        className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-white text-sm placeholder-gray-400 flex-1"
                        placeholder='Search User...'
                    />
                </div>
            </div>

            {/* User List */}
            <div className='flex flex-col'>
                {displayUsers.map((user) => (
                    <div
                        key={user._id}
                        onClick={() => {
                            setSelectedUser(user);
                            setSearchTerm("");
                            setFilteredUsers([]);
                        }}
                        className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}
                    >
                        {/* Avatar / Initial */}
                        {user?.additionalDetails?.profileImage ? (
                            <img
                                src={user.additionalDetails.profileImage}
                                className="w-[35px] h-[35px] rounded-full object-cover"
                                alt={user.name}
                            />
                        ) : (
                            <div className="w-[35px] h-[35px] rounded-full bg-violet-600 text-white flex items-center justify-center font-semibold text-sm uppercase">
                                {user.name?.charAt(0)}
                            </div>
                        )}
                        {/* Name  */}
                        <div className='flex flex-col leading-5'>
                            <p>{user?.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
