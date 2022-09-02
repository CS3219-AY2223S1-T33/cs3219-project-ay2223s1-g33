import axios from "axios";

const client = axios.create({
	baseURL: "http://127.0.0.1:8081/grpc",
});

export default client;
