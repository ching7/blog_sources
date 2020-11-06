<template>
  <div>
    <el-dialog title="图片采集"
              :visible.sync="showWin"
              :width="950"
              @close="closeCapture">
      <div id="captureWin"
           class="scan-contianer">
        <!--左侧待采集档案列表"-->
        <arch-sub-list :class="`scan-left ${isExpandArch ? 'open-scan-left' : 'close-scan-left'}`"
                       :style="isExpandArch ? {width: '241px'} : {width: '36px'}"
                       :archInfoList="scanImageList"
                       :currentArchIndex="currentArchIndex"
                       :isExpandArch="isExpandArch"
                       @arch-change="archChange"
                       @expandArchList="expandArchList" />
        <!--右侧采集展示-->
        <div class="scan-right">
          <!--档案标题栏-->
          <div id="videoTop"
               class="video-top"
               :title="currentArchInfo.imageName">{{currentArchInfo.imageName}}</div>
          <!--右侧上方采集/查看-->
          <captureView ref="captureView"
                        :model="model"
                        @changeModel="changeModel(arguments)"
                        :imageList="imageList"
                        :currImageIndex="currImageIndex"
                        :currentArchInfo="currentArchInfo"
                        :deviceFrameSizeList="deviceFrameSizeList"
                        @delImages="delImage"
                        @addImage="addImage(arguments)" />
          <!--右侧下方图片列表-->
          <div>
            <imageThumbList  ref="imageShowList"
                             class="imageShowList"
                             id="imageShowList"
                             :imageList='imageList'
                             :importLocalFlag='currentArchInfo.importLocalFlag'
                             :currentThumbIndex='currentThumbIndex'
                             @changeModel="changeModel"
                             @delImages="delImage"
                             @insertImage="insertImage"
                             @viewImage="viewImage"
                             @addImage="addImage(arguments)"
                             @addEmpty='addEmpty'
                             @onDragEnd="onDragEnd" />
            <!-- 本地上传-->
            <localUpload ref="localUpload"
                         class="localUploadScan"
                         v-show="importLocalFlag==='0'"
                         :currentArchInfo="currentArchInfo"
                         @addImage="addImage(arguments)"
                         @click="uploadFile"
                         @closeCapture="closeCapture"
                         @initArchInfo="initArchInfo"
                         @delProcessIng="delProcessIng"/>
          </div>
        </div>

      </div>
      <div slot="footer">
        <el-button type="primary"
                  @click="submit">提交</el-button>
      </div>
      <!-- 进度条 -->
      <el-dialog v-model="delProcess"
                 title="处理进度"
                 :scrollable="scrollable"
                 :transfer="transfer"
                 :mask-closable='false'>
        <el-progress :percentage="processPercent"
                    status="success"></el-progress>
        {{processMsg}}
        <div slot="footer"></div>
      </el-dialog>
      <!-- loading弹框 暂时实现的load弹框，后期等UI设计出来后再更新-->
      <div class="loadingDiv" v-if="showLoading">
        <div class='' fix>
          <i class="el-icon-loading"></i>
            <div>正在处理<span>{{currDelNum}}/{{allDelNum}}</span>张</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import imageThumbList from './imageThumbList'
import captureView from './captureView'
import archSubList from './archSubList'
import localUpload from './localUpload'

let sourceList = []
export default {
  name: 'captureFrame',
  components: {
    // 右侧下方图片列表
    imageThumbList,
    // 右侧上方采集查看
    captureView,
    // 左侧待采集档案列表
    archSubList,
    // 本地上传按钮
    localUpload
  },
  props: {
    archList: {
      type: Array,
      default: null,
      description: '档案采集信息'
    },
    deviceFrameSizeList: {
      type: Array
    },
    model:{
      type: String,
      default: 'scan'
    }
  },
  created () {
  },
  watch:{
    // showWin(val){
    //   if (val===true) {
    //     this.showWin(val,0,this.archList)
    //   }
    // }
  },
  data () {
    return {
      // 采集列表
      scanImageList: ' ',
      showWin:false,
      // 进度显示
      delProcess: false,
      showLoading: false,
      scrollable: true,
      transfer: false,
      currDelNum: 1, // 当前正在处理第n张
      allDelNum: 1, // 当前共需要处理n张
      processPercent: 0,
      processMsg: '处理中',
      // 当前查看缩略图下标
      currentThumbIndex: -1,
      // 当前采集项
      currentArchIndex: 0,
      isExpandArch: true,
      // 当前采集项信息
      currentArchInfo: {},
      // 当前采集图片列表信息/
      imageList: [],
      // 当前查看图片index
      currImageIndex: 0,
      // 视频源
      sourceList: sourceList,
      // 是否允许本地导入图片 0允许 1不允许
      importLocalFlag: ''
    }
  },
  methods: {
    changeModel: function (newModel) {
      if (newModel[0] === 'scan' && newModel[1] !== 'canvasToImage') {
        this.currentThumbIndex = -1
      }
      this.model = newModel[0]
    },
    showWinF: function (model, currentArchIndex, scanImageList) {
      this.showWin = true
      this.model = model
      this.scanImageList = scanImageList
      this.currentArchIndex = currentArchIndex
      this.currentArchInfo = this.scanImageList.find(e => e.index === this.currentArchIndex)
      /* 坐标字段待添加 */
      if (this.currentArchInfo && this.currentArchInfo.pageNum === '1') {
        this.imageList = [{ pageNo: 1, filePath: this.currentArchInfo.filePath }]
      } else {
        this.imageList = (this.currentArchInfo === undefined) || (this.currentArchInfo.pageInfo === undefined) ? [] : this.currentArchInfo.pageInfo
      }
      this.importLocalFlag = this.currentArchInfo.importLocalFlag
      this.$nextTick(function(){
        let imageShowList = document.getElementById('imageShowList')
        if (this.importLocalFlag === '0') {
          imageShowList.style.width = '530px'
        } else if (this.importLocalFlag === '1') {
          imageShowList.style.width = '607px'
        }
         this.$refs.captureView.initCapture()
        if (model === 'view') {
          // 查看模式禁用采集按钮
          this.viewImage(0)
          this.$refs.captureView.captureIconIsable('none')
        } else {
          // 采集模式
          this.$refs.captureView.captureIconIsable('all')
        }
      })
    },
    checkPageLimit () {
      let currArchPageNumLimit = this.currentArchInfo?.pageNum
      let currArchPageNum = this.currentArchInfo?.pageInfo?.length
      if (currArchPageNumLimit === 1 && currArchPageNum >= 1) {
        return false
      } else {
        return true
      }
    },
    addEmpty (index) {
      if (!this.checkPageLimit()) {
        return false
      }
      let emptyImgPage = {
        pageNo: index,
        filePath: ''
      }
      // 插入指定页数
      this.imageList.splice(index, 0, emptyImgPage)
      // pageNo重新排序
      this.imageList.map((current, index, array) => {
        current.pageNo = index
        // console.log('当前元素current=' + current + '索引index=' + index + '数组array=' + array)
        return current
      })
      this.currentThumbIndex = -1
    },
    addImage (addArgs) {
      let fileBase64 = addArgs[0]
      let insertPage = addArgs[1]
      if (insertPage !== undefined) {
        this.currentThumbIndex = insertPage
      }
      if (!this.checkPageLimit() && this.currentThumbIndex === -1) {
        this.$hMessage.info('当前只能采集1页，不能再新增！')
        return false
      }
      // imageList的pageNo从1开始排序
      let pageNum = this.imageList.length
      if (this.currentThumbIndex === -1) {
        // 尾页追加采集
        this.imageList.push({ pageNo: pageNum + 1, filePath: fileBase64 })
      } else {
        // 指定页数覆盖
        this.imageList.forEach((pageInfo, index) => {
          if (index === this.currentThumbIndex) {
            pageInfo.filePath = fileBase64
          }
        })
      }
      this.currentArchInfo.isChange = true // 记录当前采集项是否被改变
      this.currentThumbIndex = -1
    },
    delImage: function (index) {
      this.model = 'scan'
      this.$refs.captureView.captureIconIsable('all')
      this.imageList.splice(index, 1)
      this.currentArchInfo.isChange = true // 记录当前采集项是否被改变
      this.currentThumbIndex = -1
    },
    onDragEnd (imageListCopy) {
      // 给档案重新排序
      this.currentArchInfo.pageInfo = imageListCopy
      this.currentArchInfo.pageInfo.forEach((item, index) => {
        item.pageNo = index + 1
      })
      // 记录当前已改动
      this.currentArchInfo.isChange = true
    },
    insertImage (index) {
      this.currentThumbIndex = index
    },
    viewImage (index) {
      this.currentThumbIndex = index
      this.currImageIndex = index
      this.model = 'view'
      this.$refs.captureView.captureIconIsable('none')
      this.$refs.captureView.setImageShowSrc(index)
    },
    /* 改变当前采集档案 */
    archChange: function (data) {
      debugger
      this.currentThumbIndex = -1
      this.imageList = []
      // 切换档案前先关闭当前占用的摄像头，防止切换不同视频源导致的摄像头占用
      this.$refs.captureView.closeCapture() // --提高摄像头加载准确性，关闭时，统一关闭所有的摄像头
      this.$refs.captureView.captureIconIsable('all')
      this.$set(this, 'currentArchIndex', data)
      this.model = 'scan'
      this.currentArchInfo = this.scanImageList.find(e => e.index === data)
      // console.log('this.currentArchInfo======', this.currentArchInfo)
      if (this.currentArchInfo.pageNum === '1') {
        this.imageList = [{ pageNo: 1, filePath: this.currentArchInfo.filePath }]
      } else {
        this.imageList = this.currentArchInfo.pageInfo
      }
      this.importLocalFlag = this.currentArchInfo.importLocalFlag
      let imageShowList = document.getElementById('imageShowList')
      if (this.importLocalFlag === '0') {
        imageShowList.style.width = '530px'
      } else if (this.importLocalFlag === '1') {
        imageShowList.style.width = '607px'
      }
      // 初始化采集
      this.$refs.captureView.initCapture()
    },
    expandArchList () {
      // this.isExpandArch = !this.isExpandArch
    },
    // 档案上传，非彩色模式，均显示loading状态
    delProcessIng (bool, curr, all) {
      this.currDelNum = curr
      this.allDelNum = all
      this.showLoading = bool
      if (curr > all) this.showLoading = false
    },
    uploadFile () {
      this.$refs.localUpload.uploadFile(this.currentArchInfo)
    },
    /* 提交保存 */
    async submit () {
      // 判断是否存在空白页，空白页不允许提交
      let MsgTip = ''
      this.scanImageList.forEach(scanArch => {
        scanArch.pageInfo.forEach(page => {
          if (page.filePath.trim().length === 0) {
            MsgTip = MsgTip + ' ' + scanArch.imageName
            return false
          }
        })
      })
      if (MsgTip.trim().length > 0) {
        this.$hMessage.info(MsgTip + ': 存在空白页不允许提交')
        return false
      }
      // 关闭视频流和弹框
      this.showWin = false
      this.closeCapture()
      this.$emit('endScanHandler', this.scanImageList)
    },
    // 关闭视频源
    closeCapture () {
      this.showWin = false
      this.$refs.captureView.closeCapture()
    },
    initCapture () {
      this.$refs.captureView.initCapture()
    },
    initArchInfo () {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
.localUploadScan {
  height: 100px;
  padding: 5px;
  width: 66px;
}
.scan-contianer {
  display: flex;
  width: 100%;
  background: rgba(0, 0, 0, 1);
  border-radius: 12px;
  margin: -10px 5px;
}
.scan-left {
  height: 580px;
  overflow: hidden;
  background: #1f1f1f;
  border-radius: 6px;
  opacity: 0.91;
  margin: 10px 5px 10px 10px;
  position: relative;
}
.scan-right {
  flex: 1;
  height: 100%;
}
.imageShowList {
  overflow-y: hidden;
  background-color: #222222;
  border-radius: 6px;
  color: #ffffff;
  white-space: nowrap;
  width: 85%;
  margin: 0px 10px 10px 5px;
  padding: 0 5px;
  float: left;
}
.capture-win {
  background-color: #000;
  border-radius: 10px;
  width: 100%;
}
.capture-win-right {
  height: 100%;
  border-radius: 10px;
}
.video-top {
  width: 573.5px;
  height: 35px;
  font-size: 16px;
  padding: 10px 10px 0px 5px;
  color: #ffffff;
  font-family: "PingFang SC";
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.loadingDiv{
  width: 200px;
  height: 100px;
  position: absolute;
  top: 26%;
  left: 50%;
  margin-left: -100px;
}
</style>
