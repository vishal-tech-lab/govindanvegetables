import axios from "axios";

const insatnces = axios.create({
    baseURL: "https://govindanvegetables-backend.onrender.com",
});

export default insatnces;