import axios from "axios";

const insatnces = axios.create({
    baseURL: "https://saas-pos-backend-m8et.onrender.com",
});

export default insatnces;