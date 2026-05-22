import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

const request: AxiosInstance = axios.create({
    baseURL: './',
    timeout: 10000
})

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    return config
}, (error: AxiosError) => {
    return Promise.reject(error)
})

request.interceptors.response.use((response: AxiosResponse) => {
    if (response.data.error) {
        ElMessage.error(response.data.error)
        return Promise.reject(response.data.error)
    }
    return response.data
}, (error: AxiosError) => {
    return Promise.reject(error)
})

export default request