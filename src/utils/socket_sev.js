export default class SocketService {
  /**
   * 单例
   */
  static instance = null
  static get Instance() {
    //如果instance为空
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 和服务端连接的socket对象
  ws = null

  // 标识是否连接成功
  connected = false

  //记录尝试连接的次数
  sendRetryCounts = 0

  //重新连接尝试的次数
  connectRetryCount = 0
  
  //存储回调函数  callBackMapping = {socketType : callBack}
  callBackMapping = {}

//前端连接服务器
  connect() {
    // 连接服务器
    // if (!window.WebSocket)   如果没有WebSocket
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket')
    }
    this.ws = new WebSocket('ws://localhost:9998')
    // 连接服务端成功的事件
    this.ws.onopen = () => {
      console.log('连接服务端成功了')
      this.connected = true
      //重置连接次数
      this.connectRetryCount = 0
    }

    // 连接服务端失败的事件
    this.ws.onclose = () => {
      console.log('连接服务端失败了')
      this.connected = false

      this.connectRetryCount++
      //断开重新连接服务端
      setTimeout(() => {
        this.connect()
      }, (500 * connectRetryCount));

    }

    // 得到服务端发送过来的数据
    this.ws.onmessage = msg => {
      console.log('从服务端获取到了数据')
      // 真正服务端发送过来的原始数据时在msg中的data字段
      //console.log(msg.data)
      const recvData = JSON.parse(msg.data)
      const socketType = recvData.socketType
      //判断回调函数是否存在
      if(this.callBackMapping[socketType]) {
        const action = recvData.action
        if(action === 'getData') {
          const realData = JSON.parse(recvData.data)
          //此处call（this）代表的是 new SocketService()实例
          //实例调用callBackMapping[socketType],并且传递一个参数realData
          this.callBackMapping[socketType].call(this, realData)
        } else if(action === 'fullScreen') {
          this.callBackMapping[socketType].call(this, recvData)
        } else if(action === 'themeChange') {
          this.callBackMapping[socketType].call(this, recvData)
        } 
      }
    }
  }

  //回调函数的注册
  registerCallBack(socketType, callBack) {
    this.callBackMapping[socketType] = callBack
  }
 //取消某一个回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null
  }

  //发送数据的方法  防止服务器还没连接上就发送数据，会导致报错
  send(data) {
    if(this.connected) {
      this.sendRetryCounts = 0
      this.ws.send(JSON.stringify(data))
    } else {
      this.sendRetryCounts++
      setTimeout(() => {
        this.ws.send(JSON.stringify(data))
      }, this.sendRetryCounts * 500)
    }
    
  }

}