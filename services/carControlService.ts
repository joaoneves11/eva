import axios from "axios";

export class CarControlService {
    baseUrl: string;

    constructor() {
        this.baseUrl = "http://172.20.10.6";
    }

    async goForward() {
        console.log("FRENTE");
        await axios.get(`${this.baseUrl}/action?go=F`);
    }

    async goBack() {
        console.log("TRÁS");
        await axios.get(`${this.baseUrl}/action?go=B`);
    }

    async goLeft() {
        console.log("ESQUERDA");
        await axios.get(`${this.baseUrl}/action?go=L`);
    }

    async goRight() {
        console.log("DIREITA");
        await axios.get(`${this.baseUrl}/action?go=R`);
    }

    async stop() {
        console.log("PARAR");
        await axios.get(`${this.baseUrl}/action?go=S`);
    }

    async toggleLight() {
        console.log("ALTERNAR LUZ");
        await axios.get(`${this.baseUrl}/action?go=l`);
    }

    async sendMessage(message: string) {
        console.log("ENVIAR MENSAGEM:", message);
        await axios.get(`${this.baseUrl}/action?go=m${message}`);
    }

    async getStatus() {
        console.log("BUSCAR STATUS DO POWERBANK");
        const response = await axios.get(`${this.baseUrl}/status`);
        return response.data;
    }
}
