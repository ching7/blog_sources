<template>
  <div>
    <!-- 采集弹窗 -->
    <div id="videoShow"
         class="video-show">
      <viewer v-show="model==='view' && !cropper">
        <img class="image-canvas-img"
             id="imageCanvasImg"
             :src="imageSrc"
             v-show="model==='view'"
             :alt='currentArchInfo.imageName'>
      </viewer>
      <div v-if="model==='view' && cropper" class="cropper image-canvas-img"  ref="imageCanvasImg" style="text-align:center">
            <!-- 截图操作 -->
            <vueCropper
                ref="cropper"
                :img="option.imgBase"
                :outputSize="option.outputSize"
                :outputType="option.outputType"
                :canScale="option.canScale"
                :info="option.info"
                :full="option.full"
                :canMove="option.canMove"
                :canMoveBox="option.canMoveBox"
                :original="option.original"
                :autoCrop="option.autoCrop"
                :fixed="option.fixed"
                :fixedNumber="option.fixedNumber"
                :centerBox="option.centerBox"
                :infoTrue="option.infoTrue"
                :fixedBox="option.fixedBox"
                :mode="option.mode">
              </vueCropper>
          </div>
      <!--展示采集图片-->
      <!--用于储存采集信息-->
      <canvas id="canvas"
              class="image-canvas"></canvas>
      <!--视频源 禁用hover属性-->
      <!--v-show="model=='scan'"-->
      <video id="video"
             :autoplay="playStatus"
             class="video"></video>
      <!--视频源操作-->
      <div id="videoFooter"
           class="video-footer-bar">
        <div id="videoFooterCapture"
             class="video-footer-capture"
             v-show="model==='scan'"
             @click="getCapture()">
          <i class="el-icon-camera video-footer-icon-color"
                  title="拍照"
                  style="font-size: 40px !important;"></i>
        </div>
        <div class="video-footer"
             v-show="model==='scan'"
             @click="showSourceChose"
             @mouseenter="mouseenterSource"
             @mouseleave="mouseleaveSource">
          <div id="sourceChose"
               class="source-chose">
            <div v-for="item in sourceList"
                 v-on:click="changeSource(item.name)"
                 :class="`source-li ${currentsourceIndex === item.index ? 'active' : ''}`"
                 :key="item.id">
              {{ item.name }}
            </div>
          </div>
          <i font-size="24px"
                  class="el-icon-video-camera video-footer-icon-color"
                  title="切换视频源"
                  style="margin:12px;cursor: pointer"></i>
        </div>
        <div v-show="model==='scan'"
             class="video-footer"
             @click="showImageShowSec"
             @mouseenter="mouseenterImage"
             @mouseleave="mouseleaveImage">
          <div id="imageShowSec"
               class="image-show-sec">
            <div v-for="sec in secList"
                 :key="sec.index"
                 :class="`source-li ${currentSecIndex === sec.index ? 'active' : ''}`"
                 @click="setToImageListWaitTime(sec)">{{sec.name}}</div>
          </div>
          <i font-size="24px"
                  class="el-icon-time video-footer-icon-color"
                  title="画面停留时间"
                  style="margin:12px;"></i>
        </div>
        <div v-show="model==='scan'"
             class="video-footer"
             @click="showFrameSize"
             @mouseenter="mouseenterFrameSize"
             @mouseleave="mouseleaveFrameSize">
          <div id="frameSize"
               class="frameSize-chose">
            <div v-for="item in frameSizeList"
                 v-on:click="changeFrameSize(currDeviceId,item.index)"
                 :class="`source-li ${currentFrameSizeIndex === item.index ? 'active' : ''}`"
                 :key="item.index">
              {{ item.val }}
            </div>
          </div>
          <i font-size="24px"
                  class="el-icon-video-camera-solid video-footer-icon-color"
                  title="当前设备分辨率"
                  style="margin:12px;"></i>
        </div>
        <div class="video-footer"
             style="float:right"
             @click="returnCapture">
          <i id="imageChangeIcon"
                  :class="model==='scan'? 'el-icon-picture video-footer-icon-color':'el-icon-camera-solid video-footer-icon-color' "
                  font-size="24px"
                  title="切换视频/图片"></i>
        </div>
        <div v-show="(model==='view') && (imageSrc.slice(0, 7) !== 'http://' || imageSrc.slice(0, 8) !== 'https://')"
             class="video-footer"
             style="float:right"
             @click="changePicTurn">
          <i id="videoChangeIcon"
                  font-size="24px"
                  class="el-icon-refresh video-footer-icon-color"
                  title="顺时针旋转图片"></i>
        </div>
        <!-- imageSrc.slice(0, 7) !== 'http://' ：为了确保只有刚采集未上传到服务的图片才能进行图片处理，防止重复添加水印
        todo：兼容https
         -->
        <!-- 剪切图片 -->
        <div v-show="(model==='view') && (imageSrc.slice(0, 7) !== 'http://'  || imageSrc.slice(0, 8) !== 'https://') "
        class="video-footer" style="float:right" @click="startCrop">
          <i id="videoChangeIcon" class="el-icon-scissors video-footer-icon-color" font-font-size="24px" title="剪切图片"></i>
        </div>
        <div v-show="(model==='view') && (imageSrc.slice(0, 7) !== 'http://'  || imageSrc.slice(0, 8) !== 'https://')"
        class="video-footer" style="float:right" @click="clearCrop">
          <i id="videoChangeIcon" font-size="24px" class="el-icon-close video-footer-icon-color" title="清除剪切"></i>
        </div>
        <div v-show="(model==='view') && (imageSrc.slice(0, 7) !== 'http://' || imageSrc.slice(0, 8) !== 'https://' )"
        class="video-footer" style="float:right" @click="finishCrop">
          <i id="videoChangeIcon" font-size="24px" class="el-icon-finished video-footer-icon-color" title="确认剪切"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Viewer from 'v-viewer'
import Vue from 'vue'
import { VueCropper } from 'vue-cropper'
import { urlToBase64, OTSUAlgorithm, getGrayScaleImage, rotateBase64Img } from './file'
import 'viewerjs/dist/viewer.css'
Vue.use(Viewer)
Viewer.setDefaults({
  Options: {
    'inline': true,
    'button': true,
    'navbar': false,
    'title': true,
    'toolbar': true,
    'tooltip': true,
    'movable': true,
    'zoomable': true,
    'rotatable': false,
    'scalable': false,
    'transition': true,
    'fullscreen': false,
    'keyboard': true,
    'url': 'data-source'
  }
})
// 视频源
let sourceList = []
// 记录使用过的设备流
let usedStreamList = []
export default {
  name: 'captureView',
  components: { VueCropper },
  props: {
    model: {
      type: String,
      default: '',
      description: 'scan|view标志采集还是查看模式'
    },
    imageList: {
      type: Array,
      default: null,
      description: '图片列表'
    },
    currImageIndex: {
      default: 0,
      description: '当前档案采集项index'
    },
    currentArchInfo: {
      description: '当前档案信息'
    },
    deviceFrameSizeList: {
      type: Array,
      description: '视频设备支持的分辨率'
    }
  },
  data () {
    return {
      // 当前档案的默认采集 旋转角度
      archEdg: 0,
      // 当前采集图片旋转角度
      picEdg: 0,
      // 旋转角度的图片
      picEdgBase64: '',
      playStatus: 'autoplay',
      // 采集设备列表
      sourceList: [],
      // 当前选择的采集设备index
      currentsourceIndex: 0,
      // 照片采集停留时间
      secList: [
        { index: 0, name: '无' },
        { index: 1, name: '2秒' },
        { index: 2, name: '4秒' }
      ],
      // 当前选择的照片采集停留时间index
      currentSecIndex: 0,
      // 当前选择的分辨率index
      currentFrameSizeIndex: 0,
      // 采集设备分辨率
      imageWidth: 848,
      imageHeight: 480,
      // 当前设备id
      currDeviceId: '',
      // 当前设备name
      currDeviceName: '',
      // 当前设备3档分辨率-通过插件盒子取当前设备支持的分辨率
      // 3档，低-设备最低分辨率，中-设备中间分辨率，高-设备最高分辨率
      frameSizeList: [],
      sourceChoseWinShow: false,
      importLocalFlag: '',
      toImageListWaitTime: 0,
      imageSrc: '',
      cropper: false, // 是否开启剪切模式
      option: {
        imgBase: '', // 裁剪图片的地址
        info: false, // 裁剪框的大小信息
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'jpeg', // 裁剪生成图片的格式
        canScale: false, // 图片是否允许滚轮缩放
        autoCrop: false, // 是否默认生成截图框
        fixedBox: false, // 固定截图框大小 不允许改变
        fixed: false, // 是否开启截图框宽高固定比例
        // fixedNumber: [1, 1], // 截图框的宽高比例
        full: false, // 是否输出原图比例的截图
        canMove: false, // 上传图片是否可以移动
        canMoveBox: true, // 截图框能否拖动
        centerBox: true, // 截图框是否被限制在图片里面
        original: false, // 上传图片按照原始比例渲染
        infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
        mode: 'contain' // 图片默认渲染方式: contain , cover, 100px, 100% auto
      }

    }
  },
  watch: {
    'imageList': {
      handler (val) {
        this.imageSrc = this.imageList[this.currImageIndex] ? this.imageList[this.currImageIndex].filePath : '' // 查看档案采集照片
      }
    },
    'currImageIndex': {
      handler (val) {
        this.currImageIndex = val
      }
    }
  },
  async created () {
    this.imageSrc = this.imageList[this.currImageIndex] ? this.imageList[this.currImageIndex].filePath : ''
    this.option.imgBase = this.imageSrc
    if (this.imageSrc.trim() !== '' && (this.imageSrc.slice(0, 7) === 'http://' || this.imageSrc.slice(0, 8) !== 'https://')) {
      this.option.imgBase = await urlToBase64(this.imageSrc)
    }
  },
  methods: {
    // 开始截图
    async startCrop () {
      this.option.imgBase = this.imageSrc
      if (this.imageSrc.trim() !== '' && (this.imageSrc.slice(0, 7) === 'http://' || this.imageSrc.slice(0, 8) !== 'https://')) {
        this.option.imgBase = await urlToBase64(this.imageSrc)
      }
      this.cropper = true
      this.option.autoCrop = true
    },
    // 清除截图
    clearCrop () {
      if (this.cropper) {
        // this.cropper = false
        this.option.autoCrop = false
        this.$refs.cropper.clearCrop()
      }
    },
    finishCrop () {
      if (this.cropper) {
        // 获取截图的base64 数据
        this.$refs.cropper.getCropData((data) => {
          this.option.imgBase = data // 渲染剪切后的图片
          this.imageSrc = data // 同步到viewer组件
          this.picEdgBase64 = data
          this.clearCrop() // 清除截图
          // this.cropper = false // 切换会viewer组件，可点击放大查看
          this.currentArchInfo.isChange = true // 记录当前采集项是否被改变
          this.$emit('addImage', this.option.imgBase, this.currImageIndex) // 照片进入展示栏
        })
      }
    },
    changePicTurn () {
      // 点击一次基于旋转后的再旋转90
      this.picEdg = 90
      rotateBase64Img(this.picEdgBase64, this.picEdg, this.changePicTurnCallback)
    },
    changePicTurnCallback (base64data) {
      this.picEdgBase64 = base64data
      this.$set(this, 'imageSrc', base64data)
    },
    // 显示可切换的视频源
    showSourceChose () {
      let sourceChoseWin = document.getElementById('sourceChose')
      if (sourceChoseWin.style.display === '') {
        sourceChoseWin.style.display = 'inline-block'
      } else {
        sourceChoseWin.style.display = ''
      }
    },
    mouseenterSource () {
      let sourceChoseWin = document.getElementById('sourceChose')
      sourceChoseWin.style.display = 'inline-block'
    },
    mouseleaveSource () {
      let sourceChoseWin = document.getElementById('sourceChose')
      sourceChoseWin.style.display = ''
    },
    // 显示可切换的分辨率
    showFrameSize () {
      let sourceChoseWin = document.getElementById('frameSize')
      if (sourceChoseWin.style.display === '') {
        sourceChoseWin.style.display = 'inline-block'
      } else {
        sourceChoseWin.style.display = ''
      }
    },
    mouseenterFrameSize () {
      let sourceChoseWin = document.getElementById('frameSize')
      sourceChoseWin.style.display = 'inline-block'
    },
    mouseleaveFrameSize () {
      let sourceChoseWin = document.getElementById('frameSize')
      sourceChoseWin.style.display = ''
    },
    // 显示画面停留时间
    showImageShowSec () {
      let imageShowSecWin = document.getElementById('imageShowSec')
      if (imageShowSecWin.style.display === '') {
        imageShowSecWin.style.display = 'inline-block'
      } else {
        imageShowSecWin.style.display = ''
      }
    },
    mouseenterImage () {
      let imageShowSecWin = document.getElementById('imageShowSec')
      imageShowSecWin.style.display = 'inline-block'
    },
    mouseleaveImage () {
      let imageShowSecWin = document.getElementById('imageShowSec')
      imageShowSecWin.style.display = ''
    },
    // 切换视频源
    async changeSource (deviceName) {
      // 切换前先关闭上一个占用的摄像头
      this.closeCapture()
      // 初始化，选择列表第一个摄像头
      if ((deviceName === undefined || deviceName.trim() === '') && this.sourceList.length > 0) {
        this.currDeviceName = this.sourceList[0].name
        this.currentsourceIndex = this.sourceList[0].index
        this.currDeviceId = this.sourceList[0].id
      }
      for (let index = 0; index < this.sourceList.length; index++) {
        const name = this.sourceList[index].name
        if (deviceName === name) {
          this.currDeviceId = this.sourceList[index].id
          this.currDeviceName = name
          this.currentsourceIndex = this.sourceList[index].index
        }
      }
      this.captureIconIsable('all')
      // 获取设备分辨率
      // todo
      this.setResolution(this.deviceFrameSizeList)
      if (deviceName === undefined) {
        deviceName = ' '
      }
    },
    // 切换当前设备分辨率 - low mid high
    changeFrameSize (currDeviceId, setting) {
      // 切换前先的摄像头
      this.closeCapture()
      // 根据选择切换
      for (let index = 0; index < this.frameSizeList.length; index++) {
        const element = this.frameSizeList[index]
        if (index === setting) {
          this.imageWidth = element.val.split('x')[0]
          this.imageHeight = element.val.split('x')[1]
          this.currentFrameSizeIndex = element.index
        }
      }
      let media = {
        video: {
          width: this.imageWidth,
          height: this.imageHeight,
          deviceId: this.currDeviceId
        }
      }
      this.getUserMedia(media, this.success, this.error)
    },
    // 访问用户媒体设备的兼容方法
    getUserMedia: function (constraints, success, error) {
      if (navigator.mediaDevices.getUserMedia) {
        // 最新的标准API
        navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error)
      } else if (navigator.webkitGetUserMedia) {
        // webkit核心浏览器
        navigator.webkitGetUserMedia(constraints, success, error)
      } else if (navigator.mozGetUserMedia) {
        // firfox浏览器
        navigator.mozGetUserMedia(constraints, success, error)
      } else if (navigator.getUserMedia) {
        // 旧版API
        navigator.getUserMedia(constraints, success, error)
      }
    },
    // 成功加载设备，播放流文件
    success: function (stream) {
      let video = document.getElementById('video')
      video.srcObject = stream
      video.play()
      usedStreamList.push(stream)
    },
    // 出现错误提示
    error: function (error) {
      this.$hMessage.error({
        content: `访问用户媒体设备失败${error.name}, ${error.message}，` + '请到[参数]-[业务运营参数]-[菜单健康检查]进行问题排查',
        duration: 10
      })
    },
    // 关闭视频源
    closeCapture () {
      let video = document.getElementById('video')
      let stream = video.srcObject
      if (!stream) {
        return
      }
      let tracks = stream.getTracks()
      // 关闭历史设备流文件
      for (let i = 0; i < usedStreamList.length; i++) {
        let usedStream = usedStreamList[i]
        let tracks = usedStream.getTracks()
        tracks.forEach(function (track) {
          track.stop()
        })
      }
      tracks.forEach(function (track) {
        track.stop()
      })
      video.srcObject = null
    },
    // 初始化采集页面
    async initCapture () {
      // 重置视频源列表
      sourceList.length = 0
      // 重置采集项历史视频源
      usedStreamList.length = 0
      if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          this.$hMessage.info('该浏览器不支持档案采集组件，请更换为google最新版本的浏览器')
          // console.log('enumerateDevices() not supported.')
          return
        }
        // 列出摄像头和麦克风
        await navigator.mediaDevices.enumerateDevices().then(function (devices) {
          let i = 0
          devices.forEach(function (device) {
            if (device.kind === 'videoinput') {
              sourceList.push({ id: device.deviceId, name: device.label.substring(0, device.label.length - 12), index: i++ })
            }
          })
          let sourceChose = document.getElementById('sourceChose')
          sourceChose.style.marginTop = '-' + (sourceList.length * 27) + 'px'
        }).catch((err) => {
          console.log(err.name + ': ' + err.message)
        })
      } else {
        this.$hMessage.info('不支持访问用户媒体')
      }
      // 初始化等待dom渲染后的操作
      await this.$nextTick(function () {
        this.sourceList = sourceList
        this.changeSource()
      })
    },
    // 拍照
    getCapture () {
      // 检查当前档案采集页数
      let currArchPageNumLimit = this.currentArchInfo?.pageNum
      let currArchPageNum = this.currentArchInfo?.pageInfo?.length
      if (currArchPageNumLimit === 1 && currArchPageNum >= 1) {
        alert('当前档案只能采集1页，不能再新增！')
        return
      }
      this.captureIconIsable('none')
      // 清理canvas内存占用
      this.clearCanvas()
      let tempThat = this// 暂存this对象，setTimeOut中获取不到this对象
      let video = document.getElementById('video')
      let canvas = document.getElementById('canvas')
      let context = canvas.getContext('2d')
      canvas.width = this.imageWidth
      canvas.height = this.imageHeight
      try {
        context.drawImage(video, 0, 0, this.imageWidth, this.imageHeight)
      } catch (error) {
        // console.log('拍照发生异常：' + error)
      }
      // 暂时显示采集图片
      let imageCanvasImg = document.getElementById('imageCanvasImg')
      imageCanvasImg.src = canvas.toDataURL('image/jpeg', 1)
      alert('采集成功')
      // 拍照后，图标切换
      // this.model = 'view'
      this.$emit('changeModel', 'view')
      // 画面停留后，照片进入展示栏
      setTimeout(function () {
        tempThat.canvasToImage(canvas)
      }, tempThat.toImageListWaitTime)
      this.currentArchInfo.isChange = true // 记录当前采集项是否被改变
    },
    // canvas画布清空-防止画布占用过多内存
    clearCanvas () {
      let canvas = document.getElementById('canvas')
      let context = canvas.getContext('2d')
      canvas.width = this.imageWidth
      canvas.height = this.imageHeight
      context.clearRect(0, 0, this.width, this.height)
    },
    // 拍照按钮是否可用
    captureIconIsable (status) {
      let videoFooterCapture = document.getElementById('videoFooterCapture')
      videoFooterCapture.style.pointerEvents = status
    },
    // 拍照采集进入展示列表
    async canvasToImage (canvas) {
      this.captureIconIsable('all')
      let imageCanvasImg = document.getElementById('imageCanvasImg')
      imageCanvasImg.src = ''
      this.$emit('changeModel', 'scan', 'canvasToImage')
      imageCanvasImg.style.display = 'none'
      /* 根据入参数据处理图片 */
      // 色彩模式：image_set 1黑白 2灰度 3彩色
      switch (this.currentArchInfo.imageSet) {
        case '1': OTSUAlgorithm(canvas)
          break
        case '2': getGrayScaleImage(canvas)
          break
        case '3':
          break
        default:
          break
      }
      // todo DPI处理待添加
      let fileBase64 = canvas.toDataURL('image/jpeg', 1)
      // 水印处理统一移动至文件保存上传
      this.$emit('addImage', fileBase64)
    },
    // 返回拍照
    returnCapture () {
      this.picEdg = 0
      this.$emit('changeModel', 'scan')
      // 删除原始图片
      if (this.picEdgBase64.length > 0) {
        // 旋转后的图片替换指定页数
        this.$emit('addImage', this.picEdgBase64, this.currImageIndex)
        this.picEdgBase64 = ''
      }
      this.imageSrc = ''
      this.captureIconIsable('all')
    },
    // 设置图片查看url
    setImageShowSrc (index) {
      this.$nextTick(() => {
        this.picEdg = 0
        this.picEdgBase64 = ''
        this.cropper = false
        this.$emit('changeModel', 'view')
        let src = this.imageList[index].filePath
        this.picEdgBase64 = src
        this.$set(this, 'imageSrc', src)
      })
    },
    // 设置画面停留时间(目前固定)
    setToImageListWaitTime (e) {
      this.currentSecIndex = e.index
      switch (e.name) {
        case '无': this.toImageListWaitTime = 0
          break
        case '2秒': this.toImageListWaitTime = 2000
          break
        case '4秒': this.toImageListWaitTime = 4000
          break
      }
    },
    // 获取当前设备分辨率三档
    setResolution (deviceFrameSizeList) {
      let i = 0
      // 清空历史
      this.frameSizeList = []
      this.$nextTick(function () {
        for (let index = 0; index < deviceFrameSizeList.length; index++) {
          const element = deviceFrameSizeList[index]
          if (element.Name === this.currDeviceName) {
            let frameSizes = element.FrameSize
            for (let index = 0; index < frameSizes.length; index++) {
              let frameSize = frameSizes[index].split(',')[0]
              if (index === 1) {
                this.frameSizeList.push({ key: 'low', val: frameSize, index: i++ })
              } else if (index === Math.floor((frameSizes.length) / 2)) {
                this.frameSizeList.push({ key: 'mid', val: frameSize, index: i++ })
              } else if (index === frameSizes.length - 1) {
                this.frameSizeList.push({ key: 'high', val: frameSize, index: i++ })
              }
            }
          }
        }
        // 默认取最大
        if (this.frameSizeList.length > 0) {
          this.imageWidth = this.frameSizeList[2].val.split('x')[0]
          this.imageHeight = this.frameSizeList[2].val.split('x')[1]
          this.currentFrameSizeIndex = 2
          // video流加载时间点，放在dom渲染完成之后
        }
        this.closeCapture()
        let mediaOptsT = {
          video: {
            width: this.imageWidth,
            height: this.imageHeight,
            deviceId: this.currDeviceId
          }
        }
        this.getUserMedia(mediaOptsT, this.success, this.error)
      })
    }
  }
}

</script>
<style lang="scss" scoped>
i {
  font-size: 24px !important;
  display: contents;
}
.icon-bohui-capture {
  color: red;
  font-size: 20px;
}
.video-footer-bar {
  background-color: #222222;
  border-radius: 5px;
  height: 35px;
  position: relative;
}
.audit-info {
  position: absolute;
  padding-left: 5px;
  background-color: rgba(90, 70, 70, 0.8);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  width: 607.5px;
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  color: #fff;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.video {
  pointer-events: none;
  border-radius: 15px;
  width: 625px;
  height: 378px;
}
.video-show {
  width: 625px;
  border-radius: 10px;
  background-color: #222222;
  margin: 10px 10px 10px 5px;
}
.video-footer-icon-color {
  color: #ffffff;
  cursor: pointer;
}
.video-footer-capture {
  left: 44%;
  margin-top: -15px;
  position: absolute;
}
.video-footer {
  width: 40px;
  float: left;
}
.source-chose {
  display: inline-block;
  position: absolute;
  background-color: #ffffff;
  display: none;
  border-radius: 5px;
  margin-left: 10px;
}
.frameSize-chose {
  display: inline-block;
  position: absolute;
  background-color: #ffffff;
  display: none;
  border-radius: 5px;
  margin-left: 10px;
  margin-top: -80px;
}
.image-canvas-img {
  position: absolute;
  width: 625px;
  height: 378px;
  cursor: pointer;
  border: 1px solid #fff;
  border-radius: 10px;
  object-fit: contain;
  background-color: #fff;
  z-index: 10;
}
.image-show-sec {
  display: inline-block;
  position: absolute;
  background-color: #ffffff;
  display: none;
  margin-top: -80px;
  border-radius: 5px;
  margin-left: 10px;
}
.source-li {
  margin: 5px 5px;
  font-family: "PingFang SC";
  cursor: pointer;
  font-weight: bolder;
}
.source-li:hover,
.source-li.active {
  color: #037df3;
}
.image-canvas {
  cursor: pointer;
  position: absolute;
  display: none;
}
.cropper{
  .vue-cropper{
    background: #fff !important;
    border-radius: 10px;
    .cropper-modal{
      border-radius: 10px;
    }
  }
}

</style>
