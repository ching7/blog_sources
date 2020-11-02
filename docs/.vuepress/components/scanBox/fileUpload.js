import { base64ToCanvas, urlToBase64, dataURLtoFile,
  waterImgMark, waterTextMark, getFilemd5sum, deepClone} from './file'
import axios from 'axios'

// 分片上传大小
const ChunkSize = 1 * 1024 * 1024
// 上传路径
let fileUploadUrl = ''
// 拓展信息
let expandInfo = null
// 水印开关
let isWater = false
let waterMsg = ''
// 图片水印开关
let isWaterImg = false
// 图片水印
let logoWaterImg = null
/**
 * 文件列表上传前处理
 * @param {Object} scanImageList
 */
export const beforeUpload = async (scanImageList, acptInfo, isWaterVal, waterMsgVal, logoWaterImgVal, uploadUrl) => {
  fileUploadUrl = uploadUrl
  expandInfo = acptInfo
  waterMsg = waterMsgVal
  // 设置图片跨域
  isWaterImg = logoWaterImgVal.trim().length > 0
  isWater = isWaterVal
  let imgObj = new Image()
  imgObj.setAttribute('crossOrigin', 'anonymous')
  imgObj.src = logoWaterImgVal
  imgObj.onload = async () => {
    logoWaterImg = imgObj

    // 上传处理
    for (let i = 0; i < scanImageList.length; i++) {
      for (let n = 0; n < scanImageList[i].pageInfo.length; n++) {
        scanImageList[i].pageInfo[n].pageNo = n
      }
    }
    let firstScanImageList = deepClone(scanImageList)
    let otherScanImageList = deepClone(scanImageList)
    firstScanImageList.map(item => {
      item.pageInfo.splice(1)
    })
    otherScanImageList.map(item => {
      item.pageInfo.splice(0, 1)
    })
    // console.log('--------submit start---------')
    // 先分别上传各自的第一页，第一页的pageNo都必须是1，等待都成功之后，再把传各自剩下的一下子全部传出去，剩下图片的pageNo不需要再按照循序上传
    try {
      await Promise.all(firstScanImageList.reduce((res, cur) => {
        if (cur.isChange) { // 判断当前采集项是否被改变
          res = res.concat(uploadRemote(cur))
        }
        return res
      }, []))
      // console.log('第一页上传完成')
      await Promise.all(otherScanImageList.reduce((res, cur) => {
        if (cur.isChange && cur.pageInfo.length !== 0) { // 判断当前采集项是否被改变
          res = res.concat(uploadRemote(cur))
        }
        return res
      }, []))
      // console.log('所有文件上传完毕')
      this.$hMessage.success('提交成功')
    } catch (e) {
      console.log(e)
      this.$hMessage.error('提交异常')
    }
  }
}

/**
 * 单个档案上传前判断，大小文件区分处理
 * @param {Object} arch
 */
export const uploadRemote = (arch) => {
  if (arch.pageInfo.length > 0) {
    const pageNum = arch.pageNum
    return arch.pageInfo.map((page, index) => {
      return beforFileUpload(page).then(res => {
        const { upFile, md5 } = res
        return bigFileUpload({
          upFile,
          md5,
          archFileNo: arch.archFileNo,
          index: page.pageNo,
          pageNum,
          archName: arch.imageName
        })
      })
    })
  } else {
    let res = []
    res.push(bigFileUpload({
      archFileNo: arch.archFileNo
    }))
    return res
  }
}
/**
 * 大文件分片上传
 * @param {Object} param0
 */
export const bigFileUpload = ({ upFile, md5, archFileNo, index, pageNum, archName }) => {
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    withCredentials: true // 自动携带cookie
  }
  // 清空上传文件
  if (!upFile) {
    let formdata = new FormData()
    formdata.append('fileData', new File([], '')) // 传空文件，防止接口验证报错
    formdata.append('fileMD5', 0)// 完整文件的MD5码
    formdata.append('acptId', expandInfo.acpt_id)
    formdata.append('archFileNo', archFileNo)
    formdata.append('pageNo', 0) // 删除当前档案默认传0
    formdata.append('custId', expandInfo.cust_id ? expandInfo.cust_id : ' ')
    return axios.post(fileUploadUrl, formdata, config).then(res => {
      if (res.status === 200) {
        // console.log('filedelete success ', archFileNo, res)
      }
    })
  }
  const fileName = upFile.name
  const fileSize = upFile.size
  const chunkLength = Math.ceil(fileSize / ChunkSize)
  const chunksFile = (chunk) => {
    if (chunk < chunkLength) { // 递归调用上传下一片
      let formdata = new FormData()
      let filePiece = upFile.slice(chunk * ChunkSize, (chunk + 1) * ChunkSize)
      formdata.append('fileData', filePiece)// 本次上传的文件片
      formdata.append('fileMD5', md5)// 完整文件的MD5码
      formdata.append('fileName', fileName)// 文件名
      formdata.append('partSize', ChunkSize)// 单片的大小
      formdata.append('fileSize', fileSize)// 完整文件的大小
      formdata.append('position', chunk * ChunkSize)// 偏移量
      formdata.append('acptId', expandInfo.acpt_id)
      formdata.append('archFileNo', archFileNo)
      formdata.append('pageNo', (index + 1) + '') // 当前档案第几页
      formdata.append('pageNum', pageNum + '') // 当前共多少页
      formdata.append('custId', expandInfo.cust_id ? expandInfo.cust_id : ' ')
      formdata.append('operatorNo', expandInfo.operator_no)
      formdata.append('opBranchNo', expandInfo.op_branch_no)
      formdata.append('branchNo', expandInfo.branch_no)
      return axios.post(fileUploadUrl, formdata, config).then(res => {
        if (res.status === 200) {
          return chunksFile(chunk + 1)
        }
      })
    } else {
      // todo 单个文件，分片上传进度
    }
  }
  return chunksFile(0)
}

/**
 * 文件上传前处理（http和base64），统一为base64
 * 水印和
 * @param {Object} page
 */
export const beforFileUpload = async (page) => {
  // 服务器已存在的图片，需要file对象转base64
  let needWater = false
  if (page.filePath.slice(0, 7) === 'http://' || page.filePath.slice(0, 8) === 'https://') {
    needWater = false
    page.filePath = await urlToBase64(page.filePath)
  } else {
    needWater = true
  }
  // 上传前统一水印处理
  // 是否开启采集水印功能
  // 开启,服务器已存在,未进行修改的不做水印处理
  let pageFileCanvas = await base64ToCanvas(page.filePath)
  let waterFileCanvas = null
  // 图片水印
  if (isWater && needWater && isWaterImg) {
    waterFileCanvas = await waterImgMark(pageFileCanvas, logoWaterImg)
  } else {
    waterFileCanvas = pageFileCanvas
  }
  // 时间水印
  if (needWater && isWater) {
    if (waterMsg.trim().length > 0) {
      waterFileCanvas = await waterTextMark(waterFileCanvas, waterMsg)
    } else {
      waterFileCanvas = await waterTextMark(waterFileCanvas, new Date().toString())
    }
  }
  const upFile = dataURLtoFile(waterFileCanvas.toDataURL('image/jpeg', 1), new Date().getTime() + '.jpg')
  const md5 = await getFilemd5sum(upFile)
  return { upFile, md5 }
}
