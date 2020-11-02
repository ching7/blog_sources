<template>
  <div class="index-main">
    <el-button type="primary" @click="openScanBox">开始采集</el-button>
    <scan-box ref="scanBox"
      :scanList='scanList'
      :deviceFrameSizeList="deviceFrameSizeList"
      :model='model'
      @endScanHandler="endScanHandler"/>
  </div>
</template>
<script>
import scanBox from './scanBox'
export default {
  data () {
    return {
      model:'scan',
      deviceFrameSizeList: [],
      scanList: [{
        'archFileNo': '1', // 采集文件编号-建议纯数字，每一项不重复
        'filePath': '', // 当前采集项首页图片
        'haveScan': '0', // 当前采集项是否必须采集
        'imageName': '头像', // 当前采集项名称
        'imageSet': '3', // 当前采集文件类型，1:黑白 2:灰度 3:彩色
        'importLocalFlag': '0', // 当前采集是否可以本地导入 0:允许 1:不允许
        'index': 0, // 当前采集项索引
        'tipInfo': 'test', // 当前档案采集提示信息
        'isChange': false, // 当前采集项是否发生变化
        'pageInfo': [{
          'filePath': "https://gitee.com/ching7777/gitee_graph_bed/raw/master/img/80.jpg",
					'pageNo': 1,
        }], // 当前采集项每一页信息
        'pageNum': 1 // 当前采集项可以采集的页数
      },
      {
        'archFileNo': '2', // 采集文件编号-建议纯数字，每一项不重复
        'filePath': '', // 当前采集项首页图片
        'haveScan': '0', // 当前采集项是否必须采集
        'imageName': '身份证', // 当前采集项名称
        'imageSet': '1', // 当前采集文件类型，1:黑白 2:灰度 3:彩色
        'importLocalFlag': '1', // 当前采集是否可以本地导入 0:允许 1:不允许
        'index': 1, // 当前采集项索引
        'tipInfo': 'test', // 当前档案采集提示信息
        'isChange': false, // 当前采集项是否发生变化
        'pageInfo': [], // 当前采集项每一页信息
        'pageNum': 2 // 当前采集项可以采集的页数
      }],
    }
  },
  components:{
    scanBox
  },
  methods:{
    openScanBox () {
      // 初始化分辨率
      this.deviceFrameSizeList = []
      this.model = 'scan'
      this.$refs.scanBox.showWinF('scan', 0, this.scanList)
    },
    endScanHandler (scanImageList) {
      // todo 采集完成返回完整的采集信息，自己做上传处理
      console.log('endScanHandler===', scanImageList)
      // 上传
      // 移除“未匹配项”和未改变项
      let uploadScanImageList = scanImageList.filter(item => item.archFileNo !== '-1' || item.isChange !== false)
      let acptInfo = {
        acpt_id: '99999999',
        cust_id: '99999999',
        operator_no: 10571,
        op_branch_no: 1,
        branch_no: 1
      }
      let isWater = true
      let waterMsg = 'waterMsg'
      const uploadUrl = window.LOCAL_CONFIG.API_HOME + '/' + window.LOCAL_CONFIG.API_PATH.BPS + '/' + 'broker-bps/fileHandler/fileUpload'
      let waterLogoUrl = 'http://10.20.23.199:8088/g/hsbroker.ams/v/uf30/broker-ams/downloadByPath?filePath=group1/M00/00/4E/wKgh_V-MLcSEdLQOAAAAAAAAAAA040.jpg'
      beforeUpload(uploadScanImageList, acptInfo, isWater, waterMsg, waterLogoUrl, uploadUrl).then(res => {
        this.$hMessage.info('采集完成')
        // todo 每个采集项上传进度
      }).catch(err => {
        this.$hMessage.error(err)
      })
      console.log('采集完成')
    },
  }
}
</script>
