<template>
    <Form :form-list="map" />
    <Form :form-list="h" />
    <EditDialog title="请求头配置" v-model="httpHeaderVal" v-model:visible="visible" @done="done" />
</template>

<script setup lang="ts">
import Form from '@/components/Form.vue'
import { communicateProp, httpProp } from '@/config/defaultConfig'
import EditDialog from '@/components/EditDialog.vue'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { ElMessage, ElTag } from 'element-plus'

interface HttpConfig {
  method: string
  http: string
  httpHeaders: string
  httpTimeInterval: number
}

interface HttpOptions {
  httpMethod?: string
  http?: string
  httpHeaders?: Record<string, any> | string
  httpTimeInterval?: number
}

const httpHeaderVal = ref('')
const httpHeaderIndex = ref(0)
const visible = ref(false)
const m = reactive(communicateProp)
const http = reactive<HttpConfig[]>(httpProp)
const wsConnected = ref(false)
const wsTagProps = reactive({
    type: computed(() => wsConnected.value ? 'success' : 'danger'),
    effect: 'dark',
})
const wsBtnProps = reactive({
    labelWidth: '0px',
    text: computed(() => wsConnected.value ? '断开WS' : '连接WS'),
    type: computed(() => wsConnected.value ? 'danger' : 'primary'),
    block: true
})

/** 同步 WebSocket 连接状态 */
function syncWsStatus() {
    wsConnected.value = !!meta2d.store?.data?.websocketConnected
}

/** 从 meta2d.store.data 同步通信配置到表单 */
function syncCommunicateFromStore() {
    const data = meta2d.store.data;

    // WebSocket
    if (data.websocket !== undefined) {
        m.websocketUrl = data.websocket;
    }
    syncWsStatus();

    // MQTT
    if (data.mqtt !== undefined) {
        m.mqttUrl = data.mqtt;
    }
    if (data.mqttTopics !== undefined) {
        m.mqttTopics = data.mqttTopics;
    }
    if (data.mqttOptions) {
        m.clientId = data.mqttOptions.clientId || '';
        m.username = data.mqttOptions.username || '';
        m.password = data.mqttOptions.password || '';
        m.customClientId = data.mqttOptions.customClientId || false;
    }

    // HTTP
    if (data.https && Array.isArray(data.https) && data.https.length > 0) {
        http.splice(0, http.length);
        data.https.forEach((item: HttpOptions) => {
            http.push({
                method: item.httpMethod || 'GET',
                http: item.http || '',
                httpHeaders: typeof item.httpHeaders === 'object'
                    ? JSON.stringify(item.httpHeaders)
                    : (item.httpHeaders || '{}'),
                httpTimeInterval: item.httpTimeInterval || 1000
            });
        });
    }
}

let statusTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
    // 初始化时同步一次
    syncCommunicateFromStore();
    // 监听 opened 事件，在导入 JSON 后同步
    meta2d.on('opened', syncCommunicateFromStore);
    // 轮询 WebSocket 连接状态
    statusTimer = setInterval(syncWsStatus, 2000)
})

onUnmounted(() => {
    meta2d.off('opened', syncCommunicateFromStore);
    if (statusTimer) {
        clearInterval(statusTimer)
        statusTimer = null
    }
})

/** 添加httpHeader回调 */
const done = (val: string) => {
    http[httpHeaderIndex.value].httpHeaders = val
    try {
        if (!meta2d.store.data.https) {
            meta2d.store.data.https = []
        }
        !meta2d.store.data.https[httpHeaderIndex.value] && (meta2d.store.data.https[httpHeaderIndex.value] = {})
        meta2d.store.data.https[httpHeaderIndex.value].httpHeaders = JSON.parse(val); // 请求头设置
        if (meta2d.store.data.https[httpHeaderIndex.value].http) {
            meta2d.connectHttp();
        }
    } catch (error) {
        ElMessage.error('请求头格式错误')
    }

}

const map = computed(() => {
    return [
        {
            title: "websocket",
            labelWidth: 100,
            children: [
                {
                    title: "Ws链接地址",
                    type: "input",
                    prop: "websocketUrl",
                    bindProp: m,
                    event: "change",
                    option: {
                        placeholder: "请输入",
                        tip: '必须以ws(s)开头，否则不保存',
                    },
                    func(val: any) {
                        let reg = /^ws:\/\/|wss:\/\//
                        if (val && !reg.test(val)) {
                            ElMessage({
                                type: "error",
                                message: "请输入正确的地址",
                            })
                            return false
                        }
                        meta2d.store.data.websocket = val;
                        if(!val) {
                            meta2d.closeWebsocket()
                            wsConnected.value = false
                            return false
                        }
                        meta2d.connectWebsocket();
                    }
                },
                {
                    title: "连接状态",
                    type: "extend",
                    prop: "",
                    bindProp: m,
                    event: "change",
                    option: {
                        extendList: [{
                            component: ElTag,
                            props: wsTagProps,
                            text: computed(() => wsConnected.value ? '已连接' : '未连接'),
                        }]
                    },
                },
                {
                    title: "",
                    type: "button",
                    prop: "",
                    bindProp: m,
                    event: "click",
                    option: wsBtnProps,
                    func() {
                        if (wsConnected.value) {
                            meta2d.closeWebsocket()
                            wsConnected.value = false
                        } else {
                            let reg = /^ws:\/\/|wss:\/\//
                            if (!m.websocketUrl || !reg.test(m.websocketUrl)) {
                                ElMessage({ type: "error", message: "请输入正确的WebSocket地址" })
                                return false
                            }
                            meta2d.store.data.websocket = m.websocketUrl
                            meta2d.connectWebsocket()
                        }
                    }
                },
            ]
        },
        {
            title: "MQTT",
            labelWidth: 120,
            children: [
                {
                    title: "MQTT URL地址",
                    type: "input",
                    prop: "mqttUrl",
                    bindProp: m,
                    event: "change",
                    option: {
                        placeholder: "请输入",
                        tip: '必须以ws(s)开头，否则不保存',
                    },
                    func(val: any) {
                        if(!val) {
                            meta2d.store.data.mqtt = val;
                            meta2d.closeMqtt();
                        }
                    }
                },
                {
                    title: "Client ID",
                    type: "input",
                    prop: "clientId",
                    bindProp: m,
                    event: "change",
                },
                {
                    title: "关闭自动生成",
                    type: "switch",
                    prop: "customClientId",
                    bindProp: m,
                    event: "change",
                    option: {
                        placeholder: "请输入",
                        tip: '是否关闭client ID自动生成',
                    }
                },
                {
                    title: "用户名",
                    type: "input",
                    prop: "username",
                    bindProp: m,
                    event: "change",
                    option: {
                        placeholder: "请输入用户名"
                    }
                },
                {
                    title: "密码",
                    type: "input",
                    prop: "password",
                    bindProp: m,
                    event: "change",
                    option: {
                        placeholder: "请输入密码",
                        type: "password"
                    }
                },
                {
                    title: "Topics",
                    type: "input",
                    prop: "mqttTopics",
                    bindProp: m,
                    event: "change",
                    option: {
                        placeholder: "多个topic用英文','分割",
                        tip: "多个topic用英文','分割",
                    }
                },
                {
                    title: "",
                    type: "button",
                    prop: "",
                    bindProp: m,
                    event: "click",
                    option: {
                        labelWidth: '0px',
                        text: "连接MQTT",
                        block: true
                    },
                    func() {
                        let reg = /^wss?:\/\//
                        if (!m.mqttUrl || !reg.test(m.mqttUrl)) {
                            ElMessage({
                                type: "error",
                                message: "请输入正确的地址",
                            })
                            return false
                        }
                        if (m.customClientId && !m.clientId) {
                            ElMessage({
                                type: "error",
                                message: "请输入clientId",
                            })
                            return false
                        }
                        // meta2d.closeMqtt();
                        meta2d.store.data.mqtt = m.mqttUrl;
                        meta2d.store.data.mqttTopics = m.mqttTopics;
                        meta2d.store.data.mqttOptions = {
                            clientId: m.clientId,
                            username: m.username,
                            password: m.password,
                            customClientId: m.customClientId
                        };
                        meta2d.connectMqtt();
                    }
                }
            ]
        },
    ]
})


const h = computed(() => {
    return http.map((it, i) => {
        let obj = {
            title: `http${i + 1}`,
            delete: true,
            labelWidth: 100,
            func(index) {
                if (http.length < 2) {
                    ElMessage.warning('至少保留一个http');
                    return false
                }
                http.splice(index, 1)
                meta2d.store.data.https.splice(index, 1)
                meta2d.closeHttp()
                meta2d.connectHttp()
            },
            children: [
                {
                    title: "请求方式",
                    type: 'select',
                    prop: 'method',
                    bindProp: http[i],
                    event: "change",
                    option: {
                        list: [
                            { label: 'GET', value: 'GET' },
                            { label: 'POST', value: 'POST' },
                        ],
                        placeholder: "请选择请求方式"
                    },
                    func(val: any) {
                        if (!meta2d.store.data.https) {
                            meta2d.store.data.https = []
                        }
                        !meta2d.store.data.https[i] && (meta2d.store.data.https[i] = {})
                        meta2d.store.data.https[i].httpMethod = val;
                        if (meta2d.store.data.https[i].http) {
                            meta2d.connectHttp();
                        }
                    }

                },
                {
                    title: "HTTP URL地址",
                    type: 'input',
                    prop: 'http',
                    bindProp: http[i],
                    event: "change",
                    option: {
                        placeholder: "请选择URL地址"
                    },
                    func(val: any) {
                        if (!meta2d.store.data.https) {
                            meta2d.store.data.https = []
                        }
                        !meta2d.store.data.https[i] && (meta2d.store.data.https[i] = {})
                        meta2d.store.data.https[i].http = val;
                        meta2d.closeHttp()
                        meta2d.connectHttp();
                    }

                },
                {
                    title: "时间间隔",
                    type: 'number',
                    prop: 'httpTimeInterval',
                    bindProp: http[i],
                    event: "change",
                    option: {
                        placeholder: "请输入时间间隔",
                        min: 100
                    },
                    func(val: any) {
                        if (!meta2d.store.data.https) {
                            meta2d.store.data.https = []
                        }
                        !meta2d.store.data.https[i] && (meta2d.store.data.https[i] = {})
                        meta2d.store.data.https[i].httpTimeInterval = val
                        meta2d.closeHttp()
                        if (meta2d.store.data.https[i].http) {
                            meta2d.connectHttp();
                        }
                    }
                },
                {
                    title: "请求头",
                    type: 'button',
                    prop: 'httpHeaders',
                    bindProp: http[i],
                    event: "click",
                    option: {
                        text: "...",
                        type: 'default',
                        size: 'small'
                    },
                    func(e: any, childindex: any, index: any) {
                        visible.value = true
                        httpHeaderVal.value = http[index].httpHeaders
                        httpHeaderIndex.value = index
                    }
                },
            ]
        }
        let length = http.length;
        if (length === (i + 1)) {
            obj.children.push({
                title: "",
                type: 'button',
                event: "click",
                option: {
                    labelWidth: '0px',
                    text: "添加http通信",
                    block: true
                },
                func(e: any, childindex: any, index: number) {
                    http.push({
                        method: 'GET',
                        http: '',
                        httpHeaders: "{}",
                        httpTimeInterval: 1000
                    })
                }
            })
        }
        return obj
    })
})

</script>