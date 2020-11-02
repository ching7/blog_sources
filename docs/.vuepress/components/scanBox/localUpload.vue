<template>
  <div class="local-upload"
       @click="$emit('click')">
    <i class="el-icon-upload2"></i>
    <span>本地上传</span>
    <canvas id="canvas"
            style="display: none"></canvas>
    <input accept="image/jpeg,image/jpg,image/png"
           type="file"
           ref="btnFile"
           multiple="multiple"
           style="display:none"
           @change="addImage">
  </div>
</template>
<script>
import { OTSUAlgorithm, getGrayScaleImage } from './file'
export default {
  name: 'localUpload',
  props: {
    acptInfo: {
      type: Object
    },
    currentArchInfo: {
      description: '当前档案信息'
    },
    isWater: {
      type: Boolean,
      description: '是否开始采集水印功能',
      default: false
    }
  },
  data () {
    return {
      archInfo: {},
      num: 0,
      fileList: null
    }
  },
  created () {
  },
  methods: {
    uploadFile (archInfo) {
      // 检查当前档案采集页数
      let currArchPageNumLimit = this.currentArchInfo?.pageNum
      let currArchPageNum = this.currentArchInfo?.pageInfo?.length
      if (currArchPageNumLimit === 1 && currArchPageNum >= 1) {
        this.$hMessage.info('当前档案只能采集1页，不能再新增！')
        return
      }
      this.archInfo = archInfo
      this.$refs.btnFile.click()
      this.num = 0
      this.fileList = null
    },
    addImage () {
      if (!this.fileList) {
        let files = this.$refs.btnFile.files
        this.fileList = Array.from(files)
      }
      const usedFileType = ['jpg', 'jpeg', 'png']
      if (++this.num <= this.fileList.length) {
        let fileType = this.fileList[this.num - 1].type
        if (fileType !== '') {
          // 上传文件限制
          fileType = this.fileList[this.num - 1].type.substring(6)
          if (!usedFileType.includes(fileType)) {
            this.$hMessage.info('目前仅支持jpeg、jpg、png文件上传')
            return false
          }
          // 初始化进度条
          if (this.num === 1 && this.archInfo.imageSet !== '3') {
            this.$emit('delProcessIng', true, 1, this.fileList.length)
          }
          this.fileOrBlobToDataURL(this.fileList[this.num - 1])
        }
      }
      this.$refs.btnFile.value = null
    },
    // File/Blob对象转DataURL
    fileOrBlobToDataURL (file) {
      let _this = this
      let fileReader = new FileReader()
      fileReader.onload = e => {
        let img = new Image()
        img.src = e.target.result
        img.onload = async () => {
          const canvas = document.getElementById('canvas')
          const cxt = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          cxt.drawImage(img, 0, 0, img.width, img.height)// 创建canvas画布用于图像处理
          // console.log('上传文件宽：' + img.width)
          // console.log('上传文件高：' + img.height)
          /* 根据入参数据处理图片 */
          // 色彩模式：image_set 1黑白 2灰度 3彩色
          switch (_this.archInfo.imageSet) {
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
          // 水印处理移动到文件保存上传统一处理
          if (_this.archInfo.imageSet !== '3') {
            _this.$emit('delProcessIng', true, _this.num + 1, _this.fileList.length)
          }
          _this.$emit('addImage', fileBase64)
          // 递归顺序上传
          _this.addImage()
        }
      }
      fileReader.readAsDataURL(file)
    }
  }
}
</script>
<style lang="scss" scoped>
$color-icon-hover: #3597f5;
$color-icon-pressed: #0270da;
.local-upload {
  height: 100px;
  width: 66px;
  margin-left: 8px;
  background: #222222;
  color: #ffffff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  .icon {
    font-size: 16px;
    display: block;
    text-align: center;
    &:hover {
      color: $color-icon-hover;
    }
    &:active {
      color: $color-icon-pressed;
    }
  }
}
</style>
